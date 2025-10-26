PRAGMA foreign_keys=OFF;

-- Create new table with updated constraint
CREATE TABLE `__new_cars` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`distanceUsed` integer NOT NULL,
	`description` text,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`fuel_type` text NOT NULL,
	`transmission` text NOT NULL,
	`seats` integer NOT NULL,
	`status` text DEFAULT 'available',
	`mileage` integer NOT NULL,
	`price_per_day` integer NOT NULL,
	`created_at` integer NOT NULL,
	`gps` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "status_check" CHECK(`status` in ('available','unavailable','renting','approved'))
);

-- Copy all data
INSERT INTO `__new_cars` SELECT * FROM `cars`;

-- Drop old table
DROP TABLE `cars`;

-- Rename new table
ALTER TABLE `__new_cars` RENAME TO `cars`;

PRAGMA foreign_keys=ON;
