import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from "typeorm";

export class UpdatePaymentEntityForKpay1700000000000 implements MigrationInterface {
    name = 'UpdatePaymentEntityForKpay1700000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if payments table exists
        const tableExists = await queryRunner.hasTable("payments");
        
        if (!tableExists) {
            // Create the payments table if it doesn't exist
            await queryRunner.createTable(
                new Table({
                    name: "payments",
                    columns: [
                        {
                            name: "id",
                            type: "uuid",
                            isPrimary: true,
                            default: "uuid_generate_v4()"
                        },
                        {
                            name: "entity_id",
                            type: "uuid",
                            isNullable: false
                        },
                        {
                            name: "internal_reference_id",
                            type: "varchar",
                            isNullable: false,
                            isUnique: true
                        },
                        {
                            name: "amount",
                            type: "decimal",
                            precision: 10,
                            scale: 2,
                            isNullable: false
                        },
                        {
                            name: "currency",
                            type: "varchar",
                            length: "3",
                            isNullable: false
                        },
                        {
                            name: "external_reference_id",
                            type: "varchar",
                            isNullable: true
                        },
                        {
                            name: "kpay_transaction_id",
                            type: "varchar",
                            isNullable: true
                        },
                        {
                            name: "kpay_reference",
                            type: "varchar",
                            isNullable: true
                        },
                        {
                            name: "payment_url",
                            type: "text",
                            isNullable: true
                        },
                        {
                            name: "expires_at",
                            type: "timestamp",
                            isNullable: true
                        },
                        {
                            name: "created_by_id",
                            type: "uuid",
                            isNullable: false
                        },
                        {
                            name: "type",
                            type: "enum",
                            enum: ["ORDER"],
                            isNullable: false
                        },
                        {
                            name: "status",
                            type: "enum",
                            enum: ["PENDING", "PROCESSING", "SUCCESSFUL", "FAILED", "CANCELLED", "EXPIRED", "REFUNDED", "PARTIALLY_REFUNDED"],
                            default: "'PENDING'",
                            isNullable: false
                        },
                        {
                            name: "description",
                            type: "text",
                            isNullable: true
                        },
                        {
                            name: "method",
                            type: "varchar",
                            default: "'PENDING'",
                            isNullable: false
                        },
                        {
                            name: "paid_at",
                            type: "timestamp",
                            isNullable: true
                        },
                        {
                            name: "failed_at",
                            type: "timestamp",
                            isNullable: true
                        },
                        {
                            name: "cancelled_at",
                            type: "timestamp",
                            isNullable: true
                        },
                        {
                            name: "refund_id",
                            type: "varchar",
                            isNullable: true
                        },
                        {
                            name: "refunded_amount",
                            type: "decimal",
                            precision: 10,
                            scale: 2,
                            isNullable: true
                        },
                        {
                            name: "refunded_at",
                            type: "timestamp",
                            isNullable: true
                        },
                        {
                            name: "refund_reason",
                            type: "text",
                            isNullable: true
                        },
                        {
                            name: "failure_reason",
                            type: "text",
                            isNullable: true
                        },
                        {
                            name: "payer_info",
                            type: "jsonb",
                            isNullable: true
                        },
                        {
                            name: "metadata",
                            type: "jsonb",
                            isNullable: true
                        },
                        {
                            name: "last_webhook_event",
                            type: "enum",
                            enum: ["payment.successful", "payment.failed", "payment.cancelled", "payment.expired", "refund.successful", "refund.failed"],
                            isNullable: true
                        },
                        {
                            name: "last_webhook_at",
                            type: "timestamp",
                            isNullable: true
                        },
                        {
                            name: "last_status_check",
                            type: "timestamp",
                            isNullable: true
                        },
                        {
                            name: "created_at",
                            type: "timestamp",
                            default: "now()"
                        },
                        {
                            name: "updated_at",
                            type: "timestamp",
                            default: "now()"
                        }
                    ]
                }),
                true
            );

            // Create indexes
            await queryRunner.createIndex("payments", new TableIndex({
                name: "IDX_payments_entity_id",
                columnNames: ["entity_id"]
            }));

            await queryRunner.createIndex("payments", new TableIndex({
                name: "IDX_payments_kpay_transaction_id",
                columnNames: ["kpay_transaction_id"]
            }));

            await queryRunner.createIndex("payments", new TableIndex({
                name: "IDX_payments_status",
                columnNames: ["status"]
            }));

            await queryRunner.createIndex("payments", new TableIndex({
                name: "IDX_payments_created_at",
                columnNames: ["created_at"]
            }));

        } else {
            // Add new columns if table already exists
            const columns = [
                { name: "kpay_transaction_id", type: "varchar", isNullable: true },
                { name: "kpay_reference", type: "varchar", isNullable: true },
                { name: "payment_url", type: "text", isNullable: true },
                { name: "expires_at", type: "timestamp", isNullable: true },
                { name: "paid_at", type: "timestamp", isNullable: true },
                { name: "failed_at", type: "timestamp", isNullable: true },
                { name: "cancelled_at", type: "timestamp", isNullable: true },
                { name: "refund_id", type: "varchar", isNullable: true },
                { name: "refunded_amount", type: "decimal", precision: 10, scale: 2, isNullable: true },
                { name: "refunded_at", type: "timestamp", isNullable: true },
                { name: "refund_reason", type: "text", isNullable: true },
                { name: "failure_reason", type: "text", isNullable: true },
                { name: "payer_info", type: "jsonb", isNullable: true },
                { name: "metadata", type: "jsonb", isNullable: true },
                { name: "last_webhook_event", type: "varchar", isNullable: true },
                { name: "last_webhook_at", type: "timestamp", isNullable: true },
                { name: "last_status_check", type: "timestamp", isNullable: true }
            ];

            for (const column of columns) {
                const hasColumn = await queryRunner.hasColumn("payments", column.name);
                if (!hasColumn) {
                    await queryRunner.addColumn("payments", new TableColumn(column));
                }
            }

            // Update status column to use enum if it's currently varchar
            const statusColumn = await queryRunner.getTable("payments");
            const currentStatusColumn = statusColumn?.columns.find(c => c.name === "status");
            
            if (currentStatusColumn && currentStatusColumn.type !== "enum") {
                await queryRunner.changeColumn("payments", "status", new TableColumn({
                    name: "status",
                    type: "enum",
                    enum: ["PENDING", "PROCESSING", "SUCCESSFUL", "FAILED", "CANCELLED", "EXPIRED", "REFUNDED", "PARTIALLY_REFUNDED"],
                    default: "'PENDING'",
                    isNullable: false
                }));
            }

            // Add indexes if they don't exist
            const indexes = [
                { name: "IDX_payments_kpay_transaction_id", columnNames: ["kpay_transaction_id"] },
                { name: "IDX_payments_status", columnNames: ["status"] }
            ];

            for (const index of indexes) {
                const hasIndex = await queryRunner.hasIndex("payments", index.name);
                if (!hasIndex) {
                    await queryRunner.createIndex("payments", new TableIndex(index));
                }
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.dropIndex("payments", "IDX_payments_kpay_transaction_id");
        await queryRunner.dropIndex("payments", "IDX_payments_status");

        // Drop new columns
        const columnsToRemove = [
            "kpay_transaction_id",
            "kpay_reference",
            "payment_url",
            "expires_at",
            "paid_at",
            "failed_at",
            "cancelled_at",
            "refund_id",
            "refunded_amount",
            "refunded_at",
            "refund_reason",
            "failure_reason",
            "payer_info",
            "metadata",
            "last_webhook_event",
            "last_webhook_at",
            "last_status_check"
        ];

        for (const columnName of columnsToRemove) {
            const hasColumn = await queryRunner.hasColumn("payments", columnName);
            if (hasColumn) {
                await queryRunner.dropColumn("payments", columnName);
            }
        }

        // Revert status column to varchar
        await queryRunner.changeColumn("payments", "status", new TableColumn({
            name: "status",
            type: "varchar",
            isNullable: false
        }));
    }
}