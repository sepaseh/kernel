DROP INDEX `account_issuer_account_id_index`;--> statement-breakpoint
CREATE UNIQUE INDEX `account_provider_id_account_id_index` ON `account` (`provider_id`,`account_id`);--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `issuer`;