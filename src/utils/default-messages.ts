/**
 * Default (English) messages - replaces nestjs-i18n
 */
const MESSAGES: Record<string, string> = {
  "translation.user.login.loginWithPassword": "E-mail or Password is not correct!",
  "translation.user.register.weakPassword": "Your password is too weak!",
  "translation.user.register.lengthPassword": "Your password length reach out maximum",
  "translation.user.register.duplicateUserEmail": "Your email already taken",
  "translation.user.register.missing": "Missing user's phone/email",
  "translation.community.comment.title": "notification_title commented on post_title",
  "translation.community.comment.content": "notification_title commented on the post: content",
  "translation.transaction.accountBalance.title": "Account Balance Notification",
  "translation.transaction.accountBalance.content": "Your current balance current_token token",
  "translation.order.purchase.title": "An user has successfully purchased items",
  "translation.order.purchase.content": "user_display_name has successfully placed an order for items",
  "translation.course.class.start.title": "There is a class about to start",
  "translation.test.result": "You've received the results of your test",
  "translation.chat.endMessage.file": "send file",
  "translation.chat.endMessage.call": "call from",
  "translation.chat.endMessage.gift": "gift",
  "translation.chat.startMessage.message": "Message: last_message",
};

function applyReplacePattern(text: string, pattern?: object): string {
  if (!pattern || typeof text !== "string") return text;
  let out = text;
  for (const key of Object.keys(pattern)) {
    const reg = new RegExp("\\b" + key + "\\b", "g");
    out = out.replace(reg, String((pattern as any)[key]));
  }
  return out;
}

export function getDefaultMessage(key: string, pattern?: object): string {
  if (!key || key.indexOf(" ") > -1) return key;
  const message = MESSAGES[key] ?? key;
  return applyReplacePattern(message, pattern);
}
