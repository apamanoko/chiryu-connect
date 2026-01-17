CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`applicant_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`applicant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `application_post_id_idx` ON `applications` (`post_id`);--> statement-breakpoint
CREATE INDEX `application_applicant_id_idx` ON `applications` (`applicant_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `post_applicant_unique_idx` ON `applications` (`post_id`,`applicant_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`receiver_id` text NOT NULL,
	`content` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `message_application_id_idx` ON `messages` (`application_id`);--> statement-breakpoint
CREATE INDEX `message_sender_id_idx` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `message_receiver_id_idx` ON `messages` (`receiver_id`);--> statement-breakpoint
CREATE INDEX `message_created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE TABLE `post_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `post_tag_post_id_idx` ON `post_tags` (`post_id`);--> statement-breakpoint
CREATE INDEX `post_tag_tag_id_idx` ON `post_tags` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `post_tag_unique_idx` ON `post_tags` (`post_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`activity_date` integer NOT NULL,
	`activity_end_date` integer,
	`location` text NOT NULL,
	`max_participants` integer DEFAULT 1 NOT NULL,
	`current_participants` integer DEFAULT 0 NOT NULL,
	`required_skills` text,
	`reward_amount` integer,
	`reward_description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `post_author_id_idx` ON `posts` (`author_id`);--> statement-breakpoint
CREATE INDEX `post_activity_date_idx` ON `posts` (`activity_date`);--> statement-breakpoint
CREATE INDEX `post_status_idx` ON `posts` (`status`);--> statement-breakpoint
CREATE INDEX `post_created_at_idx` ON `posts` (`created_at`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tag_name_idx` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_id` text NOT NULL,
	`name` text NOT NULL,
	`bio` text,
	`avatar_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clerk_id_idx` ON `users` (`clerk_id`);