CREATE TABLE `games` (
	`id` integer PRIMARY KEY NOT NULL,
	`apiID` integer NOT NULL,
	`hteam` text,
	`ateam` text,
	`year` integer,
	`round` integer,
	`roundname` text,
	`venue` text,
	`unixtime` integer,
	`hscore` integer,
	`ascore` integer,
	`hgoals` integer,
	`hbehinds` integer,
	`agoals` integer,
	`abehinds` integer,
	`winner` text,
	`complete` integer,
	`is_final` integer,
	`is_grand_final` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `year_round_teams_idx` ON `games` (`year`,`round`);--> statement-breakpoint
CREATE UNIQUE INDEX `date_idx` ON `games` (`unixtime`);--> statement-breakpoint
CREATE UNIQUE INDEX `api_id_idx` ON `games` (`apiID`);