CREATE TABLE `carPics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`carId` text NOT NULL,
	`url` text NOT NULL,
	`uploaded_at` integer NOT NULL,
	`is_cover` integer NOT NULL,
	FOREIGN KEY (`carId`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cars` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`distanceUsed` integer NOT NULL,
	`description` text,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`fuel_type` text NOT NULL,
	`transmission` text NOT NULL,
	`seats` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
