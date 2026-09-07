# Database and file backup and restore

This is an operator procedure for a downstream deployment or a local recovery
exercise. Kernel does not schedule backups, provide a restore command, or
promise a recovery time or retention period. Choose an owner, backup frequency,
retention, acceptable data loss, and recovery deadline for the actual service.

## What must be preserved together

| Item                         | Source                                                                       | Why it matters                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Database                     | `DATABASE_URL`; default `server/data/kernel.sqlite`                          | Users, credential hashes, sessions, roles, settings, OTP challenges, calendar dates, file metadata, and migration history |
| Local file objects           | `LOCAL_STORAGE_PATH`; default `server/data/uploads`                          | Both `local-private` and `local-public`, preserving every object key                                                      |
| MinIO objects, when selected | Buckets prefixed by `MINIO_BUCKET`                                           | Both private and public buckets, object keys, content types, and bucket access policies                                   |
| Release identity             | Deployed commit/artifact and `server/drizzle` migrations                     | The application must understand the restored schema                                                                       |
| Configuration references     | Storage driver, paths/origins, and protected secret-store version references | Reconnect matching resources without putting secrets in a backup manifest                                                 |

Preserve the database and the objects as one recovery point. SQLite holds only
file metadata: a database-only backup cannot reconstruct uploads or logos.
Changing `STORAGE_DRIVER` or a bucket prefix does not rewrite existing metadata.
Secret recovery, including `BETTER_AUTH_SECRET`, belongs to the deployment's
protected secret store. Backup access must account for private files, personal
data, credential hashes, and live session records.

## Take a consistent offline backup

The baseline procedure below assumes a local SQLite file and a maintenance
window. A remote libSQL deployment needs its provider's snapshot/restore
procedure in place of filesystem copying.

1. Record the deployed release, schema migration level, selected driver, and
   backup identifier. Identify the resolved database and object-storage paths.
2. Pause incoming writes and every other writer, including direct storage
   uploads. Stop the API gracefully and confirm it has exited without a
   shutdown timeout. A process supervisor must not restart it during capture.
3. Copy the closed SQLite database to a new backup destination. Preserve any
   remaining associated journal/WAL files as part of the same stopped snapshot;
   never discard them manually. Do not copy only the main database file while
   writers are active.
4. Copy the complete local storage tree with relative bucket/object paths, or
   capture both MinIO buckets and their access-policy configuration while writes
   remain paused. Keep private objects private in the backup destination.
5. Record checksums and sizes for the database snapshot and captured objects,
   plus the release and timestamp in a manifest. Capture table counts and a file
   reference inventory from a read-only copy for the restore comparison. Keep the backup outside the
   application data directory and protect/encrypt it according to the service's
   data policy.
6. Verify the copy completed, then restart the original service and check health
   and one representative read. Retain the recovery point until its retention
   policy allows removal.

For continuous availability, design and test a database-consistent online
snapshot procedure coordinated with object-storage versioning or write
quiescence. A background copy of two independently changing stores does not
establish a consistent recovery point.

## Restore into an isolated environment first

1. Verify the manifest and checksums. Select the matching application release
   before starting anything: Kernel applies pending migrations at startup.
2. Restore into new database and storage locations. Preserve the current data
   and backup originals so a failed rehearsal cannot overwrite either.
3. Restore both local bucket directories or both MinIO buckets, keeping bucket
   names, object keys, MIME metadata, and visibility consistent with database
   records. Reapply the intended public/private policies.
4. Point the isolated instance at the restored database and storage with the
   matching driver. Configure its own allowed frontend origin and public URLs;
   obtain necessary secrets through the protected secret store. Disable the
   development seed so a recovery check cannot add sample data.
5. Before API startup, open the restored database copy with a SQLite client and
   run these checks:

   ```sql
   PRAGMA integrity_check;
   PRAGMA foreign_key_check;
   ```

   Integrity should report `ok`; the foreign-key check should return no rows.
   Verify the migration history belongs to the selected release. A newer binary
   can migrate the restored database immediately, so rehearse upgrades on a
   further copy if needed.

6. Start the isolated API and frontend. Verify `/health`, login with an
   authorized recovery test account, role access, settings, and calendar reads.
   Compare record counts with the manifest or captured inventory. Verify that
   every `files` bucket/object reference resolves, including private objects
   through an authorized storage-side check. Private objects must not become
   publicly readable; spot-check public logo URLs and content types.
7. Record elapsed recovery time, the newest recovered data timestamp, integrity
   results, and functional evidence. Resolve differences before approving the
   backup for real recovery.

Restoring a database also restores historical sessions and OTP records. Decide
whether they must be invalidated before reopening access, especially after an
authentication incident; a restore does not automatically revoke them.

## Return the service to use

Use the downstream release process to approve the verified recovery point,
pause writers, preserve the outgoing data, and switch the application to the
validated database/storage pair. Repeat health, authentication, permissions,
and file-read checks before reopening traffic. Do not merge two recovery points
or downgrade a database by replacing migration files.

Record the operator, backup ID, restored release, actual data-loss window,
recovery duration, and follow-up work. A rollback of application files alone
does not restore the database; follow [Release operations](release-operations.md)
for artifact rollback and [Database schema](database-schema.md) for migrations.
