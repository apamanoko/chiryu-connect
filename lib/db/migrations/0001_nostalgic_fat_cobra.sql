CREATE TABLE `favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `favorite_user_id_idx` ON `favorites` (`user_id`);--> statement-breakpoint
CREATE INDEX `favorite_post_id_idx` ON `favorites` (`post_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `favorite_user_post_unique_idx` ON `favorites` (`user_id`,`post_id`);