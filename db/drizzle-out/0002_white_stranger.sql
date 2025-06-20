DROP INDEX `date_idx`;--> statement-breakpoint
DROP INDEX `year_round_teams_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `unixtime_idx` ON `games` (`unixtime`);--> statement-breakpoint
CREATE UNIQUE INDEX `year_round_teams_idx` ON `games` (`year`,`round`,`hteamid`,`ateamid`);