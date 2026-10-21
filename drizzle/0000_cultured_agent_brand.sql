CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`body` text NOT NULL,
	`category` text NOT NULL,
	`status` text NOT NULL,
	`event_date` text NOT NULL,
	`link` text NOT NULL,
	`image` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
