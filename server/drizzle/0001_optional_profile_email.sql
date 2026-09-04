PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`created_at` integer NOT NULL,
	`display_username` text,
	`auth_email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`first_name` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`image` text,
	`is_system_admin` integer DEFAULT false NOT NULL,
	`last_name` text NOT NULL,
	`mobile` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`status` text DEFAULT 'active' NOT NULL,
	`updated_at` integer NOT NULL,
	`username` text
);
--> statement-breakpoint
INSERT INTO `__new_user`("created_at", "display_username", "auth_email", "email_verified", "first_name", "id", "image", "is_system_admin", "last_name", "mobile", "name", "email", "status", "updated_at", "username") SELECT "created_at", "display_username", "email", "email_verified", "first_name", "id", "image", "is_system_admin", "last_name", "mobile", "name", CASE WHEN "email" LIKE '%@kernel.local' THEN NULL ELSE "email" END, "status", "updated_at", "username" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_auth_email_unique` ON `user` (`auth_email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_mobile_unique` ON `user` (`mobile`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);
