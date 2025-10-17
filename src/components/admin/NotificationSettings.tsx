

import MailNotifications from "./MailNotifications";
import SmsNotifications from "./SmsNotifications";
import Templates from "./Templates";
import SystemMessages from "./SystemMessages";

export default function NotificationSettings() {
  return (
    <section className="p-4 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="font-semibold text-lg mb-6">Notificaties & Communicatie</h3>
      <MailNotifications />
      <SmsNotifications />
      <Templates />
      <SystemMessages />
    </section>
  );
}