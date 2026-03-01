import mysql from 'mysql2/promise';

async function main() {
    const connection = await mysql.createConnection("mysql://root@localhost:3306/sixth_Sem");

    console.log('Connected to database. Creating payment table...');

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS payment (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pidx VARCHAR(255) NOT NULL UNIQUE,
      transactionId VARCHAR(255),
      status ENUM('INITIATED', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'INITIATED',
      amountPaisa INT NOT NULL,
      userId INT,
      opportunityId INT,
      metadata JSON,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE SET NULL,
      FOREIGN KEY (opportunityId) REFERENCES opportunity(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

    try {
        await connection.execute(createTableQuery);
        console.log('Payment table created or already exists.');
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await connection.end();
    }
}

main().catch(console.error);
