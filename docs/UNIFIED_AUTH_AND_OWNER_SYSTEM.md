# SkillsCatalyst: Unified Authentication & Authoritative Owner System

## 1. Overview & Architecture

SkillsCatalyst operates on **exactly one unified authentication architecture**. There are no separate admin login portals, no secondary credential stores, and no split user tables.

```
                    ONE UNIFIED AUTHENTICATION (Supabase Auth)
                                      |
                                [Google OAuth]
                                      |
                     Authoritative Role Resolution (JWT app_metadata)
                                      |
                    +-----------------+-----------------+
                    |                                   |
              ROLE = 'owner'                      ROLE = 'student'
                    |                                   |
         +----------+----------+                        |
         |                     |                        |
   Student Mode           Admin Mode               Student Mode
   (Learning Hub)       (Platform CMS)             (Learning Hub)
```

All users authenticate through the primary login system ([/login](file:///c:/STARTUP/SKILLSCATALYST/frontend/app/login/page.tsx)) using Google OAuth or Email/Password. After authentication, authorization is derived from server-controlled database and JWT claims.

---

## 2. Authoritative Role Model

The platform recognizes two core authorization roles:
- `owner`: Authoritative platform governor with access to both **Student Mode** and **Admin Mode**.
- `student`: Standard learner with access strictly restricted to **Student Mode**.

### Authoritative Source: Supabase Auth `app_metadata.role`
`app_metadata` in Supabase Auth is strictly server-controlled (editable exclusively via `service_role` credentials). It is cryptographically signed directly into the user's Supabase access token (JWT).

- **Authorization Token Claim**: `user.app_metadata.role`
- **Synchronized Database Field**: `public.profiles.role`

The frontend and API dependencies never determine authorization based on client-side state, email strings, or local storage. If any temporary divergence occurs between the profile record and the token claim, authorization always falls back to the authoritative Auth JWT.

---

## 3. Owner Account Designation & Bootstrap

The primary owner account is:
`palamooradithyagoud@gmail.com`

### Server-Side Bootstrap CLI
To designate or verify the platform owner account without exposing sensitive operations to client applications, run the server-side bootstrap script:

```bash
# Run with default primary owner email
python backend/scripts/setup_owner.py

# Or specify a target account
python backend/scripts/setup_owner.py palamooradithyagoud@gmail.com
```

The bootstrap script performs the following operations using `service_role` credentials:
1. Queries Supabase Auth for the target user ID.
2. Updates `auth.users.raw_app_meta_data.role = 'owner'`.
3. Synchronizes `public.profiles.role = 'owner'`.
4. Verifies the final state and outputs confirmation.

### Database Migration
The SQL migration file is located at:
[supabase/migrations/20260920_add_user_roles_and_owner.sql](file:///c:/STARTUP/SKILLSCATALYST/supabase/migrations/20260920_add_user_roles_and_owner.sql)

It:
- Adds the `role` column to `public.profiles` with constraint `CHECK (role IN ('owner', 'student', 'admin', 'editor', 'moderator'))`.
- Attaches the `prevent_profile_role_escalation` trigger so no regular student can modify their own role.
- Updates `handle_new_user()` to ensure all new user registrations default strictly to `role = 'student'`.

---

## 4. Owner Mode Switching vs. Authentication

Mode switching is **application and UI state**, not re-authentication:
- **Zero Logout**: Switching between Student Mode and Admin Mode does not invalidate the session or log the user out.
- **Single Session**: The Supabase token, session cookies, and user identity remain identical across mode switches.
- **UI Persistence**: An owner's preferred mode is stored in `localStorage` under `sc_owner_mode` ("student" or "admin") for UI convenience.
- **Security Invariance**: Setting `sc_owner_mode = 'admin'` in `localStorage` grants **zero** privileges to a student account. Authorization is always validated against the server/JWT role.

---

## 5. Multi-Layer Route & API Security

### Layer 1: Next.js SSR Middleware ([middleware.ts](file:///c:/STARTUP/SKILLSCATALYST/frontend/lib/supabase/middleware.ts))
Intercepts incoming requests for `/admin` and `/admin/*`:
- If unauthenticated &rarr; Redirects to `/login?next=/admin`.
- If authenticated student (`user.app_metadata.role !== 'owner'`) &rarr; Redirects to `/dashboard` without logging out.

### Layer 2: FastAPI RBAC Dependency ([backend/services/auth_service.py](file:///c:/STARTUP/SKILLSCATALYST/backend/services/auth_service.py))
All endpoints under `/api/admin/*` enforce:
```python
@router.get("/overview")
def get_admin_overview(owner: dict = Depends(require_owner)):
    ...
```
- Missing or invalid token &rarr; `401 Unauthorized`
- Authenticated student &rarr; `403 Forbidden` (`{"detail": "Forbidden: Platform Owner privileges required."}`)

### Layer 3: Critical 401 vs. 403 Separation ([frontend/lib/api/client.ts](file:///c:/STARTUP/SKILLSCATALYST/frontend/lib/api/client.ts))
- **`401 Unauthorized`**: Indicates an expired or corrupt authentication session; triggers cleanup and redirection.
- **`403 Forbidden`**: Indicates the user is properly authenticated but lacks permission for that specific resource; **never** logs the user out.

### Layer 4: PostgreSQL Row-Level Security & Role Escalation Prevention
A PostgreSQL trigger on `public.profiles` prevents standard users from modifying the `role` column directly via API or Supabase client:
```sql
CREATE TRIGGER trg_prevent_profile_role_escalation
    BEFORE UPDATE OF role ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();
```

---

## 6. Admin CMS Foundation ([/admin](file:///c:/STARTUP/SKILLSCATALYST/frontend/app/admin/page.tsx))

The SkillsCatalyst Admin CMS console provides:
1. **Platform Overview**: Real-time stats on registered learners, active learning profiles, and system health.
2. **Hackathons & Challenges**: Management gateway for nationwide coding challenges.
3. **Scholarships & Grants**: Opportunities catalog and funding listings.
4. **Curated Tech News**: Broadcast center for platform announcements.
5. **Community Moderation**: Thread inspection and discussion monitoring.
6. **User Governance**: Directory of registered accounts and their assigned database roles.

---

## 7. How to Test Locally

### Running the Test Suite
The automated test suite validates all 26 architectural requirements:
```powershell
.\venv\Scripts\python.exe -m unittest tests/test_unified_auth_and_owner.py
```

### Manual Verification Steps
1. **Student Login**:
   - Log in with any non-owner Google or email account.
   - Verify that no mode switcher is visible in the top navbar or avatar menu.
   - Manually enter `http://localhost:3000/admin` into the browser URL bar &rarr; Automatically redirected to `/dashboard`.
   - Send `GET http://localhost:8000/api/admin/overview` with the student's Bearer token &rarr; Receives `403 Forbidden`. The student remains logged in.

2. **Owner Login (`palamooradithyagoud@gmail.com`)**:
   - Log in with Google OAuth using `palamooradithyagoud@gmail.com`.
   - The top navbar displays the mode badge and the profile dropdown reveals the **Workspace Mode Switcher**:
     ```
     Workspace Mode
     [ Student Mode ] [ Admin Mode ]
     ```
   - Click **Admin Mode** &rarr; Enters the Admin CMS console at `/admin`.
   - Refresh the page on `/admin` &rarr; Remains in Admin Mode without logging out.
   - Click **Student Mode** &rarr; Instantly switches back to the learner dashboard.
   - Send `GET http://localhost:8000/api/admin/overview` with the owner's Bearer token &rarr; Receives `200 OK` with platform telemetry.

---

## 8. Adding Future Roles (Admins, Editors, Moderators)

The role constraint on `public.profiles` and the `require_owner` architecture are forward-compatible:
- Supported role identifiers: `'owner'`, `'student'`, `'admin'`, `'editor'`, `'moderator'`.
- To create a future role-specific dependency, extend `backend/services/auth_service.py` with:
  ```python
  def require_role(*allowed_roles: str):
      def dependency(current_user: dict = Depends(require_authenticated_user)):
          if current_user.get("role") not in allowed_roles:
              raise HTTPException(status_code=403, detail="Forbidden")
          return current_user
      return dependency
  ```
- Any future role assignment must be issued exclusively via trusted server-side scripts or the owner's `/api/admin/assign-role` endpoint. Standard users cannot self-escalate.
