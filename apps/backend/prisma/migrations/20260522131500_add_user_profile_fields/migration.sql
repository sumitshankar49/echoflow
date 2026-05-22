ALTER TABLE `users`
  ADD COLUMN `gender` varchar(20) NULL,
  ADD COLUMN `dob` date NULL,
  ADD COLUMN `mobileNumber` varchar(20) NULL,
  ADD COLUMN `relationshipStatus` varchar(30) NULL;
