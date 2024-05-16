-- CreateTable
CREATE TABLE "Champ"
(
    "id"           SERIAL       NOT NULL,
    "api_id"       INTEGER,
    "name"         TEXT         NOT NULL,
    "slug"         TEXT         NOT NULL,
    "all_tours"    INTEGER      NOT NULL,
    "current_tour" INTEGER,
    "status"       BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Champ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ecup"
(
    "id"        SERIAL       NOT NULL,
    "api_id"    INTEGER,
    "name"      TEXT         NOT NULL,
    "slug"      TEXT         NOT NULL,
    "stage"     TEXT         NOT NULL,
    "status"    BOOLEAN      NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ecup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team"
(
    "id"        SERIAL       NOT NULL,
    "api_id"    INTEGER,
    "name"      TEXT         NOT NULL,
    "slug"      TEXT         NOT NULL,
    "img"       TEXT,
    "sprite"    TEXT,
    "champ_id"  INTEGER      NOT NULL,
    "games"     INTEGER      NOT NULL DEFAULT 0,
    "win"       INTEGER      NOT NULL DEFAULT 0,
    "draw"      INTEGER      NOT NULL DEFAULT 0,
    "lost"      INTEGER      NOT NULL DEFAULT 0,
    "goals"     INTEGER      NOT NULL DEFAULT 0,
    "missed"    INTEGER      NOT NULL DEFAULT 0,
    "diff"      INTEGER      NOT NULL DEFAULT 0,
    "points"    INTEGER      NOT NULL DEFAULT 0,
    "order"     INTEGER,
    "team_info" JSONB,
    "status"    BOOLEAN      NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result"
(
    "id"        SERIAL       NOT NULL,
    "date"      BIGINT,
    "res1"      INTEGER,
    "res2"      INTEGER,
    "champ_id"  INTEGER      NOT NULL,
    "team1"     INTEGER      NOT NULL,
    "team2"     INTEGER      NOT NULL,
    "stamp"     BIGINT,
    "time"      TEXT,
    "tour"      INTEGER      NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tour"
(
    "id"        SERIAL       NOT NULL,
    "date"      BIGINT,
    "res1"      INTEGER,
    "res2"      INTEGER,
    "champ_id"  INTEGER      NOT NULL,
    "team1"     INTEGER      NOT NULL,
    "team2"     INTEGER      NOT NULL,
    "stamp"     BIGINT,
    "time"      TEXT,
    "tour"      INTEGER      NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcupTeam"
(
    "id"      SERIAL  NOT NULL,
    "api_id"  INTEGER,
    "name"    TEXT    NOT NULL,
    "sprite"  TEXT    NOT NULL,
    "team_id" INTEGER,
    "status"  BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EcupTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcupStand"
(
    "id"      SERIAL  NOT NULL,
    "games"   INTEGER NOT NULL DEFAULT 0,
    "win"     INTEGER NOT NULL DEFAULT 0,
    "draw"    INTEGER NOT NULL DEFAULT 0,
    "lost"    INTEGER NOT NULL DEFAULT 0,
    "goals"   INTEGER NOT NULL DEFAULT 0,
    "missed"  INTEGER NOT NULL DEFAULT 0,
    "diff"    INTEGER NOT NULL DEFAULT 0,
    "points"  INTEGER NOT NULL DEFAULT 0,
    "order"   INTEGER,
    "group"   TEXT,
    "ecup_id" INTEGER NOT NULL,
    "team_id" INTEGER,

    CONSTRAINT "EcupStand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcupResult"
(
    "id"        SERIAL       NOT NULL,
    "date"      BIGINT,
    "res1"      INTEGER,
    "res2"      INTEGER,
    "ecup_id"   INTEGER      NOT NULL,
    "team1"     INTEGER      NOT NULL,
    "team2"     INTEGER      NOT NULL,
    "stamp"     BIGINT,
    "time"      TEXT,
    "tour"      INTEGER,
    "group"     TEXT,
    "stage"     TEXT,
    "order"     INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcupResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profile"
(
    "id"        SERIAL       NOT NULL,
    "user_id"   TEXT         NOT NULL,
    "login"     TEXT,
    "avatar"    TEXT,
    "email"     TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country"
(
    "id"         SERIAL NOT NULL,
    "name"       TEXT   NOT NULL,
    "parse_name" TEXT   NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post"
(
    "id"          SERIAL       NOT NULL,
    "img"         JSONB        NOT NULL,
    "title"       TEXT         NOT NULL,
    "slug"        TEXT         NOT NULL,
    "subtitle"    TEXT         NOT NULL,
    "body"        TEXT         NOT NULL,
    "source"      TEXT,
    "champ_id"    INTEGER,
    "ecup_id"     INTEGER,
    "date"        BIGINT       NOT NULL,
    "is_headline" BOOLEAN      NOT NULL DEFAULT false,
    "status"      BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag"
(
    "id"        SERIAL       NOT NULL,
    "name"      TEXT         NOT NULL,
    "slug"      TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagsOnPosts"
(
    "post_id"    INTEGER      NOT NULL,
    "tag_id"     INTEGER      NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TagsOnPosts_pkey" PRIMARY KEY ("post_id", "tag_id")
);

-- CreateTable
CREATE TABLE "Player"
(
    "id"          SERIAL       NOT NULL,
    "api_id"      INTEGER,
    "name"        TEXT         NOT NULL,
    "img"         TEXT         NOT NULL,
    "team_id"     INTEGER      NOT NULL,
    "country_id"  INTEGER      NOT NULL,
    "position_id" INTEGER      NOT NULL,
    "info"        JSONB,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scorer"
(
    "id"        SERIAL NOT NULL,
    "api_id"    INTEGER,
    "name"      TEXT   NOT NULL,
    "player_id" INTEGER,

    CONSTRAINT "Scorer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayersOnPosts"
(
    "post_id"    INTEGER      NOT NULL,
    "player_id"  INTEGER      NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayersOnPosts_pkey" PRIMARY KEY ("post_id", "player_id")
);

-- CreateTable
CREATE TABLE "TeamsOnPosts"
(
    "post_id"    INTEGER      NOT NULL,
    "team_id"    INTEGER      NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamsOnPosts_pkey" PRIMARY KEY ("post_id", "team_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EcupTeam_team_id_key" ON "EcupTeam" ("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "Scorer_player_id_key" ON "Scorer" ("player_id");

-- AddForeignKey
ALTER TABLE "Team"
    ADD CONSTRAINT "Team_champ_id_fkey" FOREIGN KEY ("champ_id") REFERENCES "Champ" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result"
    ADD CONSTRAINT "Result_champ_id_fkey" FOREIGN KEY ("champ_id") REFERENCES "Champ" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result"
    ADD CONSTRAINT "Result_team1_fkey" FOREIGN KEY ("team1") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result"
    ADD CONSTRAINT "Result_team2_fkey" FOREIGN KEY ("team2") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour"
    ADD CONSTRAINT "Tour_champ_id_fkey" FOREIGN KEY ("champ_id") REFERENCES "Champ" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour"
    ADD CONSTRAINT "Tour_team1_fkey" FOREIGN KEY ("team1") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour"
    ADD CONSTRAINT "Tour_team2_fkey" FOREIGN KEY ("team2") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcupTeam"
    ADD CONSTRAINT "EcupTeam_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcupStand"
    ADD CONSTRAINT "EcupStand_ecup_id_fkey" FOREIGN KEY ("ecup_id") REFERENCES "Ecup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcupStand"
    ADD CONSTRAINT "EcupStand_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "EcupTeam" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcupResult"
    ADD CONSTRAINT "EcupResult_ecup_id_fkey" FOREIGN KEY ("ecup_id") REFERENCES "Ecup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcupResult"
    ADD CONSTRAINT "EcupResult_team1_fkey" FOREIGN KEY ("team1") REFERENCES "EcupTeam" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcupResult"
    ADD CONSTRAINT "EcupResult_team2_fkey" FOREIGN KEY ("team2") REFERENCES "EcupTeam" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post"
    ADD CONSTRAINT "Post_champ_id_fkey" FOREIGN KEY ("champ_id") REFERENCES "Champ" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post"
    ADD CONSTRAINT "Post_ecup_id_fkey" FOREIGN KEY ("ecup_id") REFERENCES "Ecup" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnPosts"
    ADD CONSTRAINT "TagsOnPosts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnPosts"
    ADD CONSTRAINT "TagsOnPosts_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player"
    ADD CONSTRAINT "Player_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player"
    ADD CONSTRAINT "Player_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scorer"
    ADD CONSTRAINT "Scorer_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersOnPosts"
    ADD CONSTRAINT "PlayersOnPosts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersOnPosts"
    ADD CONSTRAINT "PlayersOnPosts_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamsOnPosts"
    ADD CONSTRAINT "TeamsOnPosts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamsOnPosts"
    ADD CONSTRAINT "TeamsOnPosts_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
