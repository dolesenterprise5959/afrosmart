import { toLocalPhone } from "@/lib/utils/phone";
import { whatsappLink } from "@/lib/services";
import type { ServiceInfo } from "@/lib/types";

// Public contact for a service business — phone + WhatsApp are shown openly
// (services opt in to public contact, unlike the call-unlock peer marketplace).
export function ServiceContact({ service }: { service: ServiceInfo }) {
  const hasPhone = Boolean(service.phone);
  const hasWa = Boolean(service.whatsapp);
  if (!service.businessName && !hasPhone && !hasWa) return null;

  return (
    <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4">
      {service.businessName && (
        <p className="text-sm font-semibold">🏪 {service.businessName}</p>
      )}
      {(hasPhone || hasWa) && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          {hasPhone && (
            <a
              href={`tel:${service.phone}`}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand text-base font-medium text-brand-foreground hover:bg-brand-dark"
            >
              📞 Call {toLocalPhone(service.phone)}
            </a>
          )}
          {hasWa && (
            <a
              href={whatsappLink(service.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] text-base font-medium text-white hover:brightness-95"
            >
              💬 WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}
