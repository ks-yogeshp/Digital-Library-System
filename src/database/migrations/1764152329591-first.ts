import { MigrationInterface, QueryRunner } from "typeorm";

export class First1764152329591 implements MigrationInterface {
    name = 'First1764152329591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reservation_request_requeststatus_enum" AS ENUM('pending', 'cancelled', 'approved', 'fulfilled', 'expire')`);
        await queryRunner.query(`CREATE TABLE "reservation_request" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "bookId" integer NOT NULL, "userId" integer NOT NULL, "requestDate" TIMESTAMP NOT NULL DEFAULT now(), "requestStatus" "public"."reservation_request_requeststatus_enum" NOT NULL DEFAULT 'pending', "active_until" TIMESTAMP, CONSTRAINT "PK_57fa054ce01480cfe26b839fc55" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'manager', 'student')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "firstName" character varying(96) NOT NULL, "lastName" character varying(96), "email" character varying(96) NOT NULL, "password" character varying(96), "role" "public"."user_role_enum" NOT NULL DEFAULT 'student', "googleId" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."borrow_record_bookstatus_enum" AS ENUM('borrowed', 'returned', 'overdue')`);
        await queryRunner.query(`CREATE TABLE "borrow_record" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "bookId" integer NOT NULL, "userId" integer NOT NULL, "borrowDate" date NOT NULL, "dueDate" date NOT NULL, "returnDate" date, "penalty" integer NOT NULL DEFAULT '0', "penaltyPaid" boolean, "extensionCount" integer NOT NULL DEFAULT '0', "bookStatus" "public"."borrow_record_bookstatus_enum" NOT NULL DEFAULT 'borrowed', CONSTRAINT "PK_bed177a8cdcca94d5adeebdc52c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."book_category_enum" AS ENUM('fiction', 'non_fiction', 'science', 'technology', 'history', 'biography', 'art', 'children', 'education', 'mystery', 'romance', 'fantasy', 'self_help', 'religion', 'poetry', 'business', 'travel', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."book_availabilitystatus_enum" AS ENUM('available', 'unavailable')`);
        await queryRunner.query(`CREATE TABLE "book" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" integer, "updatedBy" integer, "deletedBy" integer, "name" character varying(96) NOT NULL, "ISBN" character varying(20) NOT NULL, "category" "public"."book_category_enum" array NOT NULL DEFAULT '{other}', "yearOfPublication" integer NOT NULL, "version" character varying(20) NOT NULL, "availabilityStatus" "public"."book_availabilitystatus_enum" NOT NULL DEFAULT 'available', CONSTRAINT "UQ_7459018069b9c93b1d66ec013a4" UNIQUE ("ISBN"), CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "author" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" integer, "updatedBy" integer, "deletedBy" integer, "name" character varying(96) NOT NULL, "email" character varying(96) NOT NULL, "country" character varying(96), CONSTRAINT "UQ_384deada87eb62ab31c5d5afae5" UNIQUE ("email"), CONSTRAINT "PK_5a0e79799d372fe56f2f3fa6871" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "image_metadata" ("id" SERIAL NOT NULL, "authorId" integer, "bookId" integer, "imageName" character varying NOT NULL, "imagePath" character varying NOT NULL, CONSTRAINT "REL_1bf84086a98d8ffb7c87179f3d" UNIQUE ("authorId"), CONSTRAINT "REL_edea04e267af61a2991231f303" UNIQUE ("bookId"), CONSTRAINT "PK_de0be11a661d2f6ba581f93b0b3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "book_authors_author" ("bookId" integer NOT NULL, "authorId" integer NOT NULL, CONSTRAINT "PK_963de00068693ab6e5767de614b" PRIMARY KEY ("bookId", "authorId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9bf58ffb2a12a8609a738ee8ca" ON "book_authors_author" ("bookId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a4cafdf2ec9974524a5321c751" ON "book_authors_author" ("authorId") `);
        await queryRunner.query(`ALTER TABLE "reservation_request" ADD CONSTRAINT "FK_21e0b722b964eb3ba090edd651c" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation_request" ADD CONSTRAINT "FK_b4a4033310158d58c1eb1f159f2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrow_record" ADD CONSTRAINT "FK_8032acbf1eb063876edcf49e96c" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrow_record" ADD CONSTRAINT "FK_039a56f88d9fd9c6015c640a5b2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image_metadata" ADD CONSTRAINT "FK_1bf84086a98d8ffb7c87179f3d0" FOREIGN KEY ("authorId") REFERENCES "author"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image_metadata" ADD CONSTRAINT "FK_edea04e267af61a2991231f303b" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book_authors_author" ADD CONSTRAINT "FK_9bf58ffb2a12a8609a738ee8cae" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "book_authors_author" ADD CONSTRAINT "FK_a4cafdf2ec9974524a5321c7516" FOREIGN KEY ("authorId") REFERENCES "author"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_authors_author" DROP CONSTRAINT "FK_a4cafdf2ec9974524a5321c7516"`);
        await queryRunner.query(`ALTER TABLE "book_authors_author" DROP CONSTRAINT "FK_9bf58ffb2a12a8609a738ee8cae"`);
        await queryRunner.query(`ALTER TABLE "image_metadata" DROP CONSTRAINT "FK_edea04e267af61a2991231f303b"`);
        await queryRunner.query(`ALTER TABLE "image_metadata" DROP CONSTRAINT "FK_1bf84086a98d8ffb7c87179f3d0"`);
        await queryRunner.query(`ALTER TABLE "borrow_record" DROP CONSTRAINT "FK_039a56f88d9fd9c6015c640a5b2"`);
        await queryRunner.query(`ALTER TABLE "borrow_record" DROP CONSTRAINT "FK_8032acbf1eb063876edcf49e96c"`);
        await queryRunner.query(`ALTER TABLE "reservation_request" DROP CONSTRAINT "FK_b4a4033310158d58c1eb1f159f2"`);
        await queryRunner.query(`ALTER TABLE "reservation_request" DROP CONSTRAINT "FK_21e0b722b964eb3ba090edd651c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a4cafdf2ec9974524a5321c751"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9bf58ffb2a12a8609a738ee8ca"`);
        await queryRunner.query(`DROP TABLE "book_authors_author"`);
        await queryRunner.query(`DROP TABLE "image_metadata"`);
        await queryRunner.query(`DROP TABLE "author"`);
        await queryRunner.query(`DROP TABLE "book"`);
        await queryRunner.query(`DROP TYPE "public"."book_availabilitystatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."book_category_enum"`);
        await queryRunner.query(`DROP TABLE "borrow_record"`);
        await queryRunner.query(`DROP TYPE "public"."borrow_record_bookstatus_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "reservation_request"`);
        await queryRunner.query(`DROP TYPE "public"."reservation_request_requeststatus_enum"`);
    }

}
