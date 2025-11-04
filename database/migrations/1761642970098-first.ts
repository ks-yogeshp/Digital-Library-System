import { MigrationInterface, QueryRunner } from "typeorm";

export class First1761642970098 implements MigrationInterface {
    name = 'First1761642970098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reservation_request_requeststatus_enum" AS ENUM('pending', 'cancelled', 'approved', 'fulfilled', 'expire')`);
        await queryRunner.query(`CREATE TABLE "reservation_request" ("id" SERIAL NOT NULL, "requestDate" TIMESTAMP NOT NULL DEFAULT now(), "requestStatus" "public"."reservation_request_requeststatus_enum" NOT NULL DEFAULT 'pending', "bookId" integer, "userId" integer, CONSTRAINT "PK_57fa054ce01480cfe26b839fc55" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying(96) NOT NULL, "lastName" character varying(96), "email" character varying(96) NOT NULL, "password" character varying(96) NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."borrow_record_bookstatus_enum" AS ENUM('borrowed', 'returned', 'overdue')`);
        await queryRunner.query(`CREATE TABLE "borrow_record" ("id" SERIAL NOT NULL, "borrowDate" TIMESTAMP NOT NULL, "dueDate" TIMESTAMP NOT NULL, "returnDate" TIMESTAMP NOT NULL, "penalty" integer, "bookStatus" "public"."borrow_record_bookstatus_enum" NOT NULL DEFAULT 'borrowed', "bookId" integer, "userId" integer, CONSTRAINT "PK_bed177a8cdcca94d5adeebdc52c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."book_category_enum" AS ENUM('fiction', 'non ficton', 'science', 'technology', 'history', 'biography', 'art', 'children', 'education', 'mystery', 'romance', 'fantasy', 'self help', 'religion', 'poetry', 'business', 'travel', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."book_availibilitystatus_enum" AS ENUM('available', 'unavailable')`);
        await queryRunner.query(`CREATE TABLE "book" ("id" SERIAL NOT NULL, "name" character varying(96) NOT NULL, "ISBN" character varying(20) NOT NULL, "category" "public"."book_category_enum" array NOT NULL DEFAULT '{other}', "yearOfPublication" integer NOT NULL, "version" character varying(20) NOT NULL, "availabilityStatus" "public"."book_availibilitystatus_enum" NOT NULL DEFAULT 'available', CONSTRAINT "UQ_7459018069b9c93b1d66ec013a4" UNIQUE ("ISBN"), CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "author" ("id" SERIAL NOT NULL, "name" character varying(96) NOT NULL, "email" character varying(96) NOT NULL, "country" character varying(96), CONSTRAINT "UQ_384deada87eb62ab31c5d5afae5" UNIQUE ("email"), CONSTRAINT "PK_5a0e79799d372fe56f2f3fa6871" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "book_authors_author" ("bookId" integer NOT NULL, "authorId" integer NOT NULL, CONSTRAINT "PK_963de00068693ab6e5767de614b" PRIMARY KEY ("bookId", "authorId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9bf58ffb2a12a8609a738ee8ca" ON "book_authors_author" ("bookId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a4cafdf2ec9974524a5321c751" ON "book_authors_author" ("authorId") `);
        await queryRunner.query(`ALTER TABLE "reservation_request" ADD CONSTRAINT "FK_21e0b722b964eb3ba090edd651c" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation_request" ADD CONSTRAINT "FK_b4a4033310158d58c1eb1f159f2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrow_record" ADD CONSTRAINT "FK_8032acbf1eb063876edcf49e96c" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrow_record" ADD CONSTRAINT "FK_039a56f88d9fd9c6015c640a5b2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book_authors_author" ADD CONSTRAINT "FK_9bf58ffb2a12a8609a738ee8cae" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "book_authors_author" ADD CONSTRAINT "FK_a4cafdf2ec9974524a5321c7516" FOREIGN KEY ("authorId") REFERENCES "author"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_authors_author" DROP CONSTRAINT "FK_a4cafdf2ec9974524a5321c7516"`);
        await queryRunner.query(`ALTER TABLE "book_authors_author" DROP CONSTRAINT "FK_9bf58ffb2a12a8609a738ee8cae"`);
        await queryRunner.query(`ALTER TABLE "borrow_record" DROP CONSTRAINT "FK_039a56f88d9fd9c6015c640a5b2"`);
        await queryRunner.query(`ALTER TABLE "borrow_record" DROP CONSTRAINT "FK_8032acbf1eb063876edcf49e96c"`);
        await queryRunner.query(`ALTER TABLE "reservation_request" DROP CONSTRAINT "FK_b4a4033310158d58c1eb1f159f2"`);
        await queryRunner.query(`ALTER TABLE "reservation_request" DROP CONSTRAINT "FK_21e0b722b964eb3ba090edd651c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a4cafdf2ec9974524a5321c751"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9bf58ffb2a12a8609a738ee8ca"`);
        await queryRunner.query(`DROP TABLE "book_authors_author"`);
        await queryRunner.query(`DROP TABLE "author"`);
        await queryRunner.query(`DROP TABLE "book"`);
        await queryRunner.query(`DROP TYPE "public"."book_availibilitystatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."book_category_enum"`);
        await queryRunner.query(`DROP TABLE "borrow_record"`);
        await queryRunner.query(`DROP TYPE "public"."borrow_record_bookstatus_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "reservation_request"`);
        await queryRunner.query(`DROP TYPE "public"."reservation_request_requeststatus_enum"`);
    }

}
