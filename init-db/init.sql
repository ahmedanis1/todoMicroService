-- Create databases
CREATE DATABASE IF NOT EXISTS userdb;
CREATE DATABASE IF NOT EXISTS tododb;

-- Create users
CREATE USER IF NOT EXISTS 'userservice'@'%' IDENTIFIED BY 'userpass123';
CREATE USER IF NOT EXISTS 'todoservice'@'%' IDENTIFIED BY 'todopass123';

-- Grant privileges
GRANT ALL PRIVILEGES ON userdb.* TO 'userservice'@'%';
GRANT ALL PRIVILEGES ON tododb.* TO 'todoservice'@'%';

-- Apply changes
FLUSH PRIVILEGES;