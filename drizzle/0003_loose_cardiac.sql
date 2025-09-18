PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_carPics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`carId` integer NOT NULL,
	`url` text NOT NULL,
	`uploaded_at` integer NOT NULL,
	`is_cover` integer NOT NULL,
	FOREIGN KEY (`carId`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_carPics`("id", "carId", "url", "uploaded_at", "is_cover") SELECT "id", "carId", "url", "uploaded_at", "is_cover" FROM `carPics`;--> statement-breakpoint
DROP TABLE `carPics`;--> statement-breakpoint
ALTER TABLE `__new_carPics` RENAME TO `carPics`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_rental` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`carid` integer NOT NULL,
	`rentedBy` text NOT NULL,
	`rentedAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`isComplete` integer NOT NULL,
	FOREIGN KEY (`carid`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rentedBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_rental`("id", "carid", "rentedBy", "rentedAt", "expiresAt", "isComplete") SELECT "id", "carid", "rentedBy", "rentedAt", "expiresAt", "isComplete" FROM `rental`;--> statement-breakpoint
DROP TABLE `rental`;--> statement-breakpoint
ALTER TABLE `__new_rental` RENAME TO `rental`;