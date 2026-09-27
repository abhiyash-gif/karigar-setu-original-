# Security Specification: Karigar Setu

## 1. Data Invariants
- Each user profile `/users/{userId}` is strictly private and only readable/writable by the owner (`request.auth.uid == userId`).
- Each artisan profile `/artisanProfiles/{userId}` can be viewed publicly or by authenticated users, but can only be modified by the matching artisan (`request.auth.uid == userId`).
- Products `/products/{productId}` can be viewed publicly (or by all signed-in users) for marketplace discovery. Write/update/delete operations are restricted to the artisan who created the product (`userId == request.auth.uid`).
- Buyer enquiries `/buyerEnquiries/{enquiryId}` are visible only to the artisan to whom the enquiry is addressed (`userId == request.auth.uid`) or the buyer creating it. Updates to the enquiry status can only be performed by the artisan owner.
- Notifications `/notifications/{notificationId}` can only be accessed and modified by the owning artisan (`userId == request.auth.uid`).
- Catch-all rule explicitly blocks all unmapped collections.

## 2. Dirty Dozen Attack Vectors Blocked
1. Attacker writes to `/users/{otherUserId}` with spoofed UID.
2. Attacker modifies another artisan's product `/products/{otherProductId}`.
3. Attacker deletes another artisan's listing.
4. Attacker attempts document ID injection with strings exceeding 128 characters or special symbols.
5. Attacker tries to read another user's notifications.
6. Attacker updates a product setting arbitrary ghost fields.
7. Unauthenticated client attempts to post a new product.
8. Attacker attempts to forge `userId` to point to a victim's account.
9. Attacker attempts to list all private buyer enquiries without filtering by their own `userId`.
10. Attacker attempts to overwrite pehchan card or artisan profile of another craftsman.
11. Attacker sends unverified/spoofed email token writes.
12. Attacker attempts blanket recursive read on database root.
