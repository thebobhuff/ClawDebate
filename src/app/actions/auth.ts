### F:/Projects/ClawDebate/src/app/actions/auth.ts
```typescript
1: ### F:/Projects/ClawDebate/src/app/actions/auth.ts
2: ```typescript
3: 1: ### F:/Projects/ClawDebate/src/app/actions/auth.ts
4: 2: ```typescript
5: 3: 1: ### F:/Projects/ClawDebate/src/app/actions/auth.ts
6: 4: 2: ```typescript
7: 5: 3: 1: "use server";
8: 6: 4: 2: 
9: 7: 5: 3: /**
10: 8: 6: 4:  * Authentication Server Actions
11: 9: 7: 5:  * Server-side actions for authentication operations
12: 10: 8: 6:  */
13: 11: 9: 7: 
14: 12: 10: 8: import { revalidatePath } from "next/cache";
15: 13: 11: 9: import { createClient } from "@/lib/supabase/server";
16: 14: 12: 10: import { createServiceRoleClient } from "@/lib/supabase/service-role";
17: 15: 13: 11: import { getAuthUser } from "@/lib/auth/session";
18: 16: 14: 12: import { ensureHumanProfile } from "@/lib/auth/profile";
19: 17: 15: 13: import { generateApiKey } from "@/lib/supabase/auth";
20: 18: 16: 14: import {
21: 19: 17: 15:   agentRegistrationSchema,
22: 20: 18: 16:   signInSchema,
23: 21: 19: 17:   signUpSchema,
24: 22: 20: 18:   apiKeySchema,
25: 23: 21: 19:   type AgentRegistrationFormData,
26: 24: 22: 20:   type SignInFormData,
27: 25: 23: 21:   type SignUpFormData,
28: 26: 24: 22:   type AgentRegistrationResponse,
29: 27: 25: 23:   type AuthResponse,
30: 28: 26: 24:   type ApiValidationResponse,
31: 29: 27: 25: } from "@/types/auth";
32: 30: 28: 26: 
33: 31: 29: 27: // ============================================================================
34: 32: 30: 28: // AGENT REGISTRATION
35: 33: 31: 29: // ============================================================================
36: 34: 32: 30: 
37: 35: 33: 31: /**
38: 36: 34: 32:  * Register a new agent
39: 37: 35: 33:  */
40: 38: 36: 34: export async function registerAgent(
41: 39: 37: 35:   formData: AgentRegistrationFormData,
42: 40: 38: 36: ): Promise<AgentRegistrationResponse> {
43: 41: 39: 37:   try {
44: 42: 40: 38:     // Validate input
45: 43: 41: 39:     const validatedData = agentRegistrationSchema.parse(formData);
46: 44: 42: 40: 
47: 45: 43: 41:     const serviceRoleSupabase = createServiceRoleClient();
48: 46: 44: 42: 
49: 47: 45: 43:     // Check if agent name already exists
50: 48: 46: 44:     const { data: existingUser } = await serviceRoleSupabase
51: 49: 47: 45:       .from("profiles")
52: 50: 48: 46:       .select("id")
53: 51: 49: 47:       .eq("display_name", validatedData.name)
54: 52: 50: 48:       .eq("user_type", "agent")
55: 53: 51: 49:       .single();
56: 54: 52: 50: 
57: 55: 53: 51:     if (existingUser) {
58: 56: 54: 52:       return {
59: 57: 55: 53:         success: false,
60: 58: 56: 54:         error: "Agent name already exists",
61: 59: 57: 55:       };
62: 60: 58: 56:     }
63: 61: 59: 57: 
64: 62: 60: 58:     // Create a backing auth user because profiles.id references auth.users(id).
65: 63: 61: 59:     const agentEmailSlug =
66: 64: 62: 60:       validatedData.name
67: 65: 63: 61:         .toLowerCase()
68: 66: 64: 62:         .replace(/[^a-z0-9]+/g, "-")
69: 67: 65: 63:         .replace(/^-+|-+$/g, "")
70: 68: 66: 64:         .slice(0, 40) || "agent";
71: 69: 67: 65:     const agentEmail = `${agentEmailSlug}-${crypto.randomUUID()}@agents.clawdebate.local`;
72: 70: 68: 66:     const agentPassword = crypto.randomUUID() + crypto.randomUUID();
73: 71: 69: 67: 
74: 72: 70: 68:     const { data: authUserData, error: authError } =
75: 73: 71: 69:       await serviceRoleSupabase.auth.admin.createUser({
76: 74: 72: 70:         email: agentEmail,
77: 75: 73: 71:         password: agentPassword,
78: 76: 74: 72:         email_confirm: true,
79: 77: 75: 73:         user_metadata: {
80: 78: 76: 74:           display_name: validatedData.name,
81: 79: 77: 75:         },
82: 80: 78: 76:       });
83: 81: 79: 77: 
84: 82: 80: 78:     if (authError || !authUserData.user) {
85: 83: 81: 79:       console.error("Error creating agent auth user:", authError);
86: 84: 82: 80:       return {
87: 85: 83: 81:         success: false,
88: 86: 84: 82:         error: "Failed to create agent profile",
89: 87: 85: 83:       };
90: 88: 86: 84:     }
91: 89: 87: 85: 
92: 90: 88: 86:     // Generate API key and verification code
93: 91: 89: 87:     const apiKey = generateApiKey();
94: 92: 90: 88:     const verificationCode = Math.random()
95: 93: 91: 89:       .toString(36)
96: 94: 92: 90:       .substring(2, 10)
97: 95: 93: 91:       .toUpperCase();
98: 96: 94: 92: 
99: 97: 95: 93:     // Update the auto-created profile row for this auth user into an agent profile.
100: 98: 96: 94:     const { data: profile, error: profileError } = await serviceRoleSupabase
101: 99: 97: 95:       .from("profiles")
102: 100: 98: 96:       .update({
103: 101: 99: 97:         user_type: "agent",
104: 102: 100: 98:         display_name: validatedData.name,
105: 103: 101: 99:         bio: validatedData.description,
106: 104: 102: 100:         agent_api_key: apiKey,
107: 105: 103: 101:         is_claimed: false,
108: 106: 104: 102:         verification_status: "pending",
109: 107: 105: 103:       })
110: 108: 106: 104:       .eq("id", authUserData.user.id)
111: 109: 107: 105:       .select()
112: 110: 108: 106:       .single();
113: 111: 109: 107: 
114: 112: 110: 108:     if (profileError || !profile) {
115: 113: 111: 109:       console.error("Error creating agent profile:", profileError);
116: 114: 112: 110:       await serviceRoleSupabase.auth.admin.deleteUser(authUserData.user.id);
117: 115: 113: 111:       return {
118: 116: 114: 112:         success: false,
119: 117: 115: 113:         error: "Failed to create agent profile",
120: 118: 116: 114:       };
121: 119: 117: 115:     }
122: 120: 118: 116: 
123: 121: 119: 117:     const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
124: 122: 120: 118:     const claimUrl = `${appUrl}/claim/${profile.claim_code}`;
125: 123: 121: 119: 
126: 124: 122: 120:     revalidatePath("/");
127: 125: 123: 121: 
128: 126: 124: 122:     return {
129: 127: 125: 123:       success: true,
130: 128: 126: 124:       agent: {
131: 129: 127: 125:         api_key: apiKey,
132: 130: 128: 126:         claim_url: claimUrl,
133: 131: 129: 127:         verification_code: verificationCode,
134: 132: 130: 128:       },
135: 133: 131: 129:     };
136: 134: 132: 130:   } catch (error) {
137: 135: 133: 131:     console.error("Error registering agent:", error);
138: 136: 134: 132:     if (error instanceof Error && error.name === "ZodError") {
139: 137: 135: 133:       return {
140: 138: 136: 134:         success: false,
141: 139: 137: 135:         error: "Invalid input data",
142: 140: 138: 136:       };
143: 141: 139: 137:     }
144: 142: 140: 138:     return {
145: 143: 141: 139:       success: false,
146: 144: 142: 140:       error: "An unexpected error occurred",
147: 145: 143: 141:     };
148: 146: 144: 142:   }
149: 147: 145: 143: }
150: 148: 146: 144: 
151: 149: 147: 145: // ============================================================================
152: 150: 148: 146: // SIGN IN
153: 151: 149: 147: // ============================================================================
154: 152: 150: 148: 
155: 153: 151: 149: /**
156: 154: 152: 150:  * Sign in a user
157: 155: 153: 151:  */
158: 156: 154: 152: export async function signIn(formData: SignInFormData): Promise<AuthResponse> {
159: 157: 155: 153:   try {
160: 158: 156: 154:     // Validate input
161: 159: 157: 155:     const validatedData = signInSchema.parse(formData);
162: 160: 158: 156: 
163: 161: 159: 157:     const supabase = await createClient();
164: 162: 160: 158: 
165: 163: 161: 159:     // Attempt to sign in
166: 164: 162: 160:     const { data, error } = await supabase.auth.signInWithPassword({
167: 165: 163: 161:       email: validatedData.email,
168: 166: 164: 162:       password: validatedData.password,
169: 167: 165: 163:     });
170: 168: 166: 164: 
171: 169: 167: 165:     if (error) {
172: 170: 168: 166:       return {
173: 171: 169: 167:         success: false,
174: 172: 170: 168:         error: "Invalid email or password",
175: 173: 171: 169:       };
176: 174: 172: 170:     }
177: 175: 173: 171: 
178: 176: 174: 172:     if (!data.user) {
179: 177: 175: 173:       return {
180: 178: 176: 174:         success: false,
181: 179: 177: 175:         error: "Sign in failed",
182: 180: 178: 176:       };
183: 181: 179: 177:     }
184: 182: 180: 178: 
185: 183: 181: 179:     let { data: profile } = await supabase
186: 184: 182: 180:       .from("profiles")
187: 185: 183: 181:       .select("user_type")
188: 186: 184: 182:       .eq("id", data.user.id)
189: 187: 185: 183:       .single();
190: 188: 186: 184: 
191: 189: 187: 185:     if (!profile) {
192: 190: 188: 186:       profile = await ensureHumanProfile({
193: 191: 189: 187:         id: data.user.id,
194: 192: 190: 188:         email: data.user.email,
195: 193: 191: 189:         userMetadata: (data.user.user_metadata ?? {}) as Record<
196: 194: 192: 190:           string,
197: 195: 193: 191:           unknown
198: 196: 194: 192:         >,
199: 197: 195: 193:       });
200: 198: 196: 194:     }
201: 199: 197: 195: 
202: 200: 198: 196:     const userType = profile?.user_type;
203: 201: 199: 197:     const redirectTo =
204: 202: 200: 198:       userType === "admin"
205: 203: 201: 199:         ? "/admin"
206: 204: 202: 200:         : userType === "agent"
207: 205: 203: 201:           ? "/agent/debates"
208: 206: 204: 202:           : "/profile";
209: 207: 205: 203: 
210: 208: 206: 204:     revalidatePath("/");
211: 209: 207: 205: 
212: 210: 208: 206:     return {
213: 211: 209: 207:       success: true,
214: 212: 210: 208:       redirectTo,
215: 213: 211: 209:     };
216: 214: 212: 210:   } catch (error) {
217: 215: 213: 211:     console.error("Error signing in:", error);
218: 216: 214: 212:     if (error instanceof Error && error.name === "ZodError") {
219: 217: 215: 213:       return {
220: 218: 216: 214:         success: false,
221: 219: 217: 215:         error: "Invalid input data",
222: 220: 218: 216:       };
223: 221: 219: 217:     }
224: 222: 220: 218:     return {
225: 223: 221: 219:       success: false,
226: 224: 222: 220:       error: "An unexpected error occurred",
227: 225: 223: 221:     };
228: 226: 224: 222:   }
229: 227: 225: 223: }
230: 228: 226: 224: 
231: 229: 227: 225: // ============================================================================
232: 230: 228: 226: // SIGN UP
233: 231: 229: 227: // ============================================================================
234: 232: 230: 228: 
235: 233: 231: 229: /**
236: 234: 232: 230:  * Sign up a new human user
237: 235: 233: 231:  */
238: 236: 234: 232: export async function signUp(formData: SignUpFormData): Promise<AuthResponse> {
239: 237: 235: 233:   try {
240: 238: 236: 234:     // Validate input
241: 239: 237: 235:     const validatedData = signUpSchema.parse(formData);
242: 240: 238: 236: 
243: 241: 239: 237:     const supabase = await createClient();
244: 242: 240: 238: 
245: 243: 241: 239:     // Create user account with Supabase Auth
246: 244: 242: 240:     const { data, error } = await supabase.auth.signUp({
247: 245: 243: 241:       email: validatedData.email,
248: 246: 244: 242:       password: validatedData.password,
249: 247: 245: 243:       options: {
250: 248: 246: 244:         data: {
251: 249: 247: 245:           display_name:
252: 250: 248: 246:             validatedData.displayName || validatedData.email.split("@")[0],
253: 251: 249: 247:         },
254: 252: 250: 248:       },
255: 253: 251: 249:     });
256: 254: 252: 250: 
257: 255: 253: 251:     if (error) {
258: 256: 254: 252:       if (
259: 257: 255: 253:         error.message.toLowerCase().includes("rate limit") ||
260: 258: 256: 254:         error.message.toLowerCase().includes("email rate limit") ||
261: 259: 257: 255:         error.message.toLowerCase().includes("security purposes")
262: 260: 258: 256:       ) {
263: 261: 259: 257:         return {
264: 262: 260: 258:           success: false,
265: 263: 261: 259:           error:
266: 264: 262: 260:             "Too many email attempts. Please wait a few minutes and try again.",
267: 265: 263: 261:         };
268: 266: 264: 262:       }
269: 267: 265: 263: 
270: 268: 266: 264:       if (error.message.includes("already registered")) {
271: 269: 267: 265:         return {
272: 270: 268: 266:           success: false,
273: 271: 269: 267:           error: "Email already registered",
274: 272: 270: 268:         };
275: 273: 271: 269:       }
276: 274: 272: 270:       return {
277: 275: 273: 271:         success: false,
278: 276: 274: 272:         error: error.message || "Failed to create account",
279: 277: 275: 273:       };
280: 278: 276: 274:     }
281: 279: 277: 275: 
282: 280: 278: 276:     if (!data.user) {
283: 281: 279: 277:       return {
284: 282: 280: 278:         success: false,
285: 283: 281: 279:         error: "Sign up failed",
286: 284: 282: 280:       };
287: 285: 283: 281:     }
288: 286: 284: 282: 
289: 287: 285: 283:     // Keep profile creation idempotent.
290: 288: 286: 284:     // A DB trigger (`on_auth_user_created`) may already create this row.
291: 289: 287: 285:     const profile = await ensureHumanProfile({
292: 290: 288: 286:       id: data.user.id,
293: 291: 289: 287:       email: validatedData.email,
294: 292: 290: 288:       userMetadata: {
295: 293: 291: 289:         display_name:
296: 294: 292: 290:           validatedData.displayName || validatedData.email.split("@")[0],
297: 295: 293: 291:       },
298: 296: 294: 292:     });
299: 297: 295: 293: 
300: 298: 296: 294:     if (!profile) {
301: 299: 297: 295:       return {
302: 300: 298: 296:         success: false,
303: 301: 299: 297:         error: "Failed to create profile",
304: 302: 300: 298:       };
305: 303: 301: 299:     }
306: 304: 302: 300: 
307: 305: 303: 301:     revalidatePath("/");
308: 306: 304: 302: 
309: 307: 305: 303:     return {
310: 308: 306: 304:       success: true,
311: 309: 307: 305:       redirectTo: "/signin",
312: 310: 308: 306:     };
313: 311: 309: 307:   } catch (error) {
314: 312: 310: 308:     console.error("Error signing up:", error);
315: 313: 311: 309:     if (error instanceof Error && error.name === "ZodError") {
316: 314: 312: 310:       return {
317: 315: 313: 311:         success: false,
318: 316: 314: 312:         error: "Invalid input data",
319: 317: 315: 313:       };
320: 318: 316: 314:     }
321: 319: 317: 315:     return {
322: 320: 318: 316:       success: false,
323: 321: 319: 317:       error: "An unexpected error occurred",
324: 322: 320: 318:     };
325: 323: 321: 319:   }
326: 324: 322: 320: }
327: 325: 323: 321: 
328: 326: 324: 322: // ============================================================================
329: 327: 325: 323: // SIGN OUT
330: 328: 326: 324: // ============================================================================
331: 329: 327: 325: 
332: 330: 328: 326: /**
333: 331: 329: 327:  * Sign out current user
334: 332: 330: 328:  */
335: 333: 331: 329: export async function signOut(): Promise<{ success: boolean; error?: string }> {
336: 334: 332: 330:   try {
337: 335: 333: 331:     const supabase = await createClient();
338: 336: 334: 332: 
339: 337: 335: 333:     const { error } = await supabase.auth.signOut();
340: 338: 336: 334: 
341: 339: 337: 335:     if (error) {
342: 340: 338: 336:       return {
343: 341: 339: 337:         success: false,
344: 342: 340: 338:         error: error.message || "Failed to sign out",
345: 343: 341: 339:       };
346: 344: 342: 340:     }
347: 345: 343: 341: 
348: 346: 344: 342:     revalidatePath("/");
349: 347: 345: 343:     revalidatePath("/agent/debates");
350: 348: 346: 344:     revalidatePath("/admin");
351: 349: 347: 345: 
352: 350: 348: 346:     return {
353: 351: 349: 347:       success: true,
354: 352: 350: 348:     };
355: 353: 351: 349:   } catch (error) {
356: 354: 352: 350:     console.error("Error signing out:", error);
357: 355: 353: 351:     return {
358: 356: 354: 352:       success: false,
359: 357: 355: 353:       error: "An unexpected error occurred",
360: 358: 356: 354:     };
361: 359: 357: 355:   }
362: 360: 358: 356: }
363: 361: 359: 357: 
364: 362: 360: 358: // ============================================================================
365: 363: 361: 359: // API KEY VALIDATION
366: 364: 362: 360: // ============================================================================
367: 365: 363: 361: 
368: 366: 364: 362: /**
369: 367: 365: 363:  * Validate agent API key (for external API calls)
370: 368: 366: 364:  */
371: 369: 367: 365: export async function validateAPIKey(
372: 370: 368: 366:   apiKey: string,
373: 371: 369: 367: ): Promise<ApiValidationResponse> {
374: 372: 370: 368:   try {
375: 373: 371: 369:     // Validate input
376: 374: 372: 370:     const validatedData = apiKeySchema.parse({ apiKey });
377: 375: 373: 371: 
378: 376: 374: 372:     const supabase = createServiceRoleClient();
379: 377: 375: 373: 
380: 378: 376: 374:     const { data: agent, error } = await supabase
381: 379: 377: 375:       .from("profiles")
382: 380: 378: 376:       .select("*")
383: 381: 379: 377:       .eq("agent_api_key", validatedData.apiKey)
384: 382: 380: 378:       .eq("user_type", "agent")
385: 383: 381: 379:       .single();
386: 384: 382: 380: 
387: 385: 383: 381:     if (error || !agent || agent.verification_status === "flagged") {
388: 386: 384: 382:       return {
389: 387: 385: 383:         valid: false,
390: 388: 386: 384:         error: "Invalid API key",
391: 389: 387: 385:       };
392: 390: 388: 386:     }
393: 391: 389: 387: 
394: 392: 390: 388:     const agentData = agent;
395: 393: 391: 389: 
396: 394: 392: 390:     return {
397: 395: 393: 391:       valid: true,
398: 396: 394: 392:       agent: {
399: 397: 395: 393:         agentId: agentData.id,
400: 398: 396: 394:         agentName: agentData.display_name,
401: 399: 397: 395:         capabilities: agentData.agent_capabilities as Record<
402: 400: 398: 396:           string,
403: 401: 399: 397:           any
404: 402: 400: 398:         > | null,
405: 403: 401: 399:       },
406: 404: 402: 400:     };
407: 405: 403: 401:   } catch (error) {
408: 406: 404: 402:     console.error("Error validating API key:", error);
409: 407: 405: 403:     if (error instanceof Error && error.name === "ZodError") {
410: 408: 406: 404:       return {
411: 409: 407: 405:         valid: false,
412: 410: 408: 406:         error: "Invalid API key format",
413: 411: 409: 407:       };
414: 412: 410: 408:     }
415: 413: 411: 409:     return {
416: 414: 412: 410:       valid: false,
417: 415: 413: 411:       error: "An unexpected error occurred",
418: 416: 414: 412:     };
419: 417: 415: 413:   }
420: 418: 416: 414: }
421: 419: 417: 415: 
422: 420: 418: 416: // ============================================================================
423: 421: 419: 417: // PASSWORD RESET
424: 422: 420: 418: // ============================================================================
425: 423: 421: 419: 
426: 424: 422: 420: /**
427: 425: 423: 421:  * Request password reset email
428: 426: 424: 422:  */
429: 427: 425: 423: export async function requestPasswordReset(
430: 428: 426: 424:   email: string,
431: 429: 427: 425: ): Promise<{ success: boolean; error?: string }> {
432: 430: 428: 426:   try {
433: 431: 429: 427:     const supabase = await createClient();
434: 432: 430: 428: 
435: 433: 431: 429:     const { error } = await supabase.auth.resetPasswordForEmail(email, {
436: 434: 432: 430:       redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`,
437: 435: 433: 431:     });
438: 436: 434: 432: 
439: 437: 435: 433:     if (error) {
440: 438: 436: 434:       return {
441: 439: 437: 435:         success: false,
442: 440: 438: 436:         error: error.message || "Failed to send reset email",
443: 441: 439: 437:       };
444: 442: 440: 438:     }
445: 443: 441: 439: 
446: 444: 442: 440:     return {
447: 445: 443: 441:       success: true,
448: 446: 444: 442:     };
449: 447: 445: 443:   } catch (error) {
450: 448: 446: 444:     console.error("Error requesting password reset:", error);
451: 449: 447: 445:     return {
452: 450: 448: 446:       success: false,
453: 451: 449: 447:       error: "An unexpected error occurred",
454: 452: 450: 448:     };
455: 453: 451: 449:   }
456: 454: 452: 450: }
457: 455: 453: 451: 
458: 456: 454: 452: /**
459: 457: 455: 453:  * Update password
460: 458: 456: 454:  */
461: 459: 457: 455: export async function updatePassword(
462: 460: 458: 456:   newPassword: string,
463: 461: 459: 457: ): Promise<{ success: boolean; error?: string }> {
464: 462: 460: 458:   try {
465: 463: 461: 459:     const supabase = await createClient();
466: 464: 462: 460: 
467: 465: 463: 461:     const { error } = await supabase.auth.updateUser({
468: 466: 464: 462:       password: newPassword,
469: 467: 465: 463:     });
470: 468: 466: 464: 
471: 469: 467: 465:     if (error) {
472: 470: 468: 466:       return {
473: 471: 469: 467:         success: false,
474: 472: 470: 468:         error: error.message || "Failed to update password",
475: 473: 471: 469:       };
476: 474: 472: 470:     }
477: 475: 473: 471: 
478: 476: 474: 472:     return {
479: 477: 475: 473:       success: true,
480: 478: 476: 474:     };
481: 479: 477: 475:   } catch (error) {
482: 480: 478: 476:     console.error("Error updating password:", error);
483: 481: 479: 477:     return {
484: 482: 480: 478:       success: false,
485: 483: 481: 479:       error: "An unexpected error occurred",
486: 484: 482: 480:     };
487: 485: 483: 481:   }
488: 486: 484: 482: }
489: 487: 485: 483: 
490: 488: 486: 484: // ============================================================================
491: 489: 487: 485: // AGENT CLAIMING
492: 490: 488: 486: // ============================================================================
493: 491: 489: 487: 
494: 492: 490: 488: /**
495: 493: 491: 489:  * Claim an agent
496: 494: 492: 490:  */
497: 495: 493: 491: export async function claimAgent(
498: 496: 494: 492:   agentId: string,
499: 497: 495: 493: ): Promise<{ success: boolean; error?: string }> {
500: 498: 496: 494:   try {
501: 499: 497: 495:     const authUser = await getAuthUser();
502: 500: 498: 496:     if (!authUser) {
503: 501: 499: 497:       return {
504: 502: 500: 498:         success: false,
505: 503: 501: 499:         error: "You must be signed in to claim an agent",
506: 504: 502: 500:       };
507: 505: 503: 501:     }
508: 506: 504: 502: 
509: 507: 505: 503:     if (authUser.userType !== "human" && authUser.userType !== "admin") {
510: 508: 506: 504:       return {
511: 509: 507: 505:         success: false,
512: 510: 508: 506:         error: "Only human or admin accounts can claim agents",
513: 511: 509: 507:       };
514: 512: 510: 508:     }
515: 513: 511: 509: 
516: 514: 512: 510:     const serviceRoleSupabase = createServiceRoleClient();
517: 515: 513: 511: 
518: 516: 514: 512:     // Atomic claim: only succeeds if the row is currently unclaimed.
519: 517: 515: 513:     const { data: claimedAgent, error: updateError } = await serviceRoleSupabase
520: 518: 516: 514:       .from("profiles")
521: 519: 517: 515:       .update({
522: 520: 518: 516:         is_claimed: true,
523: 521: 519: 517:         owner_id: authUser.id,
524: 522: 520: 518:         verification_status: "verified",
525: 523: 521: 519:       })
526: 524: 522: 520:       .eq("id", agentId)
527: 525: 523: 521:       .or("is_claimed.is.null,is_claimed.eq.false")
528: 526: 524: 522:       .eq("user_type", "agent")
529: 527: 525: 523:       .select("id")
530: 528: 526: 524:       .single();
531: 529: 527: 525: 
532: 530: 528: 526:     if (updateError || !claimedAgent) {
533: 531: 529: 527:       console.error("Error claiming agent:", updateError);
534: 532: 530: 528:       return { success: false, error: "Agent not found or already claimed" };
535: 533: 531: 529:     }
536: 534: 532: 530: 
537: 535: 533: 531:     revalidatePath(`/claim`);
538: 536: 534: 532:     revalidatePath("/agent/debates");
539: 537: 535: 533: 
540: 538: 536: 534:     return { success: true };
541: 539: 537: 535:   } catch (error) {
542: 540: 538: 536:     console.error("Error in claimAgent action:", error);
543: 541: 539: 537:     return { success: false, error: "An unexpected error occurred" };
544: 542: 540: 538:   }
545: 543: 541: 539: }
546: 544: 542: 540: 
547: 545: 543: 541: export async function updateClaimedAgentProfile(
548: 546: 544: 542:   formData: FormData,
549: 547: 545: 543: ): Promise<void> {
550: 548: 546: 544:   try {
551: 549: 547: 545:     const authUser = await getAuthUser();
552: 550: 548: 546:     if (!authUser) {
553: 551: 549: 547:       return;
554: 552: 550: 548:     }
555: 553: 551: 549: 
556: 554: 552: 550:     const agentId = formData.get("agentId");
557: 555: 553: 551:     const displayName = formData.get("displayName");
558: 556: 554: 552:     const bio = formData.get("bio");
559: 557: 555: 553: 
560: 558: 556: 554:     if (
561: 559: 557: 555:       typeof agentId !== "string" ||
562: 560: 558: 556:       typeof displayName !== "string" ||
563: 561: 559: 557:       typeof bio !== "string"
564: 562: 560: 558:     ) {
565: 563: 561: 559:       return;
566: 564: 562: 560:     }
567: 565: 563: 561: 
568: 566: 564: 562:     const normalizedName = displayName.trim();
569: 567: 565: 563:     const normalizedBio = bio.trim();
570: 568: 566: 564: 
571: 569: 567: 565:     if (normalizedName.length < 2 || normalizedName.length > 100) {
572: 570: 568: 566:       return;
573: 571: 569: 567:     }
574: 572: 570: 568: 
575: 573: 571: 569:     if (normalizedBio.length > 500) {
576: 574: 572: 570:       return;
577: 575: 573: 571:     }
578: 576: 574: 572: 
579: 577: 575: 573:     const supabase = createServiceRoleClient();
580: 578: 576: 574:     const { data: existingAgent } = await supabase
581: 579: 577: 575:       .from("profiles")
582: 580: 578: 576:       .select("id, owner_id, user_type")
583: 581: 579: 577:       .eq("id", agentId)
584: 582: 580: 578:       .single();
585: 583: 581: 579: 
586: 584: 582: 580:     const canManage =
587: 585: 583: 581:       existingAgent &&
588: 586: 584: 582:       existingAgent.user_type === "agent" &&
589: 587: 585: 583:       (authUser.userType === "admin" || existingAgent.owner_id === authUser.id);
590: 588: 586: 584: 
591: 589: 587: 585:     if (!canManage) {
592: 590: 588: 586:       return;
593: 591: 589: 587:     }
594: 592: 590: 588: 
595: 593: 591: 589:     const { error } = await supabase
596: 594: 592: 590:       .from("profiles")
597: 595: 593: 591:       .update({
598: 596: 594: 592:         display_name: normalizedName,
599: 597: 595: 593:         bio: normalizedBio || null,
600: 598: 596: 594:       })
601: 599: 597: 595:       .eq("id", agentId)
602: 600: 598: 596:       .eq("user_type", "agent");
603: 601: 599: 597: 
604: 602: 600: 598:     if (error) {
605: 603: 601: 599:       console.error("Error updating claimed agent profile:", error);
606: 604: 602: 600:       return;
607: 605: 603: 601:     }
608: 606: 604: 602: 
609: 607: 605: 603:     revalidatePath("/profile");
610: 608: 606: 604:     revalidatePath("/profile/agents");
611: 609: 607: 605:     revalidatePath(`/stats/agents/${agentId}`);
612: 610: 608: 606:     revalidatePath("/admin/agents");
613: 611: 609: 607:   } catch (error) {
614: 612: 610: 608:     console.error("Error updating claimed agent profile:", error);
615: 613: 611: 609:   }
616: 614: 612: 610: }
617: 615: 613: ```
618: 616: ```
619: ```
```
