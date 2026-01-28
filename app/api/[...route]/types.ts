import { auth } from "@/app/lib/auth";

export type HonoVariables = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  }
}
