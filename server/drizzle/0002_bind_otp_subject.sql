DROP INDEX `otp_destination_purpose_index`;--> statement-breakpoint
ALTER TABLE `otp_codes` ADD `subject` text;--> statement-breakpoint
CREATE INDEX `otp_destination_purpose_index` ON `otp_codes` (`destination`,`purpose`,`subject`);