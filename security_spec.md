# KhmerVibe Security Specification

## 1. Data Invariants
1. Every video document must have a valid `ownerId` strictly matching the authenticated creator's `request.auth.uid`.
2. Comments can only be created under existing video documents; the author ID must match `request.auth.uid`.
3. Likes are idempotent documents keyed by `request.auth.uid`. A user cannot forge a like under someone else's identity.
4. Normal users cannot escalate their privileges to `admin` or modify system-managed moderation flags.
5. Bootstrapped Super Admin (`chhnchhin94@gmail.com`) is authorized for platform oversight, video take-downs, and report resolution.
6. Videos marked as `private` can only be read by their owner or an administrator.
7. Document IDs must conform to the regex `^[a-zA-Z0-9_\-]+$` with maximum length 128 characters to prevent injection attacks.
8. Maximum string sizes are enforced on all fields (Title <= 200, Description <= 5000, Comments <= 1000).

## 2. The "Dirty Dozen" Threat Payloads (Must be Denied)
1. **Unauthenticated Video Write**: POST to `/videos/{id}` without `request.auth`.
2. **Owner Spoofing**: User A creates video with `ownerId: "user_b"`.
3. **Role Self-Escalation**: User sets `role: "admin"` during profile registration or update.
4. **Oversized Title Bomb**: Video title exceeding 200 characters or containing 100KB spam.
5. **Private Video Snooping**: User B attempting to `get` User A's private video.
6. **Ghost Key Injection**: Sending undocumented fields (e.g., `verifiedBadge: true`) on video create.
7. **Comment Impersonation**: User A posting comment with `authorId: "user_c"`.
8. **Malicious ID Poisoning**: Document ID with newline, path traversal (`../`), or 1.5KB string.
9. **Unauthenticated Report Read**: Non-admin viewer attempting to list reports collection.
10. **Report Tampering**: Non-admin user updating report status to `dismissed`.
11. **Email Spoof Attack**: Setting admin claims with `email_verified: false`.
12. **Foreign Like Delete**: User A attempting to delete User B's like document.
