-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'MANAGER', 'FINANCE', 'MEMBER');

-- CreateEnum
CREATE TYPE "DossierStatus" AS ENUM ('ACTIVE', 'DORMANT', 'ARCHIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BusinessPhase" AS ENUM ('PROSPECTION', 'CLOSING', 'LCA', 'LCMP', 'LCSC', 'CHANTIER', 'RECEPTION');

-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('LCA', 'LCMP', 'LCSC');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Competence" AS ENUM ('ARCHITECTURE', 'INTERIOR_ARCHITECTURE', 'PROJECT_PILOTAGE', 'MAITRE_OEUVRE', 'RELEVE', 'DESSINATEUR', 'GESTION', 'PROSPECTION', 'CLOSING', 'SAV');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'SENT', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('MISSION', 'TIME_BASED', 'DEPOSIT', 'INTERMEDIATE', 'BALANCE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TRANSFER', 'CARD', 'CHEQUE', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityEntityType" AS ENUM ('WORKSPACE', 'CLIENT', 'CONTACT', 'DOSSIER', 'TASK', 'MILESTONE', 'MISSION', 'INVOICE', 'PAYMENT', 'ATTACHMENT', 'USER');

-- CreateEnum
CREATE TYPE "AttachmentEntityType" AS ENUM ('DOSSIER', 'CLIENT', 'CONTACT', 'TASK', 'MILESTONE', 'INVOICE', 'PAYMENT');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "locale" TEXT NOT NULL DEFAULT 'fr-FR',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionToken")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "clientCode" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "vatNumber" TEXT,
    "siren" TEXT,
    "billingAddress" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "roleLabel" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "mobilePhone" TEXT,
    "notes" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dossier" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "DossierStatus" NOT NULL DEFAULT 'ACTIVE',
    "phase" "BusinessPhase" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'France',
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "projectLabel" TEXT,
    "startDate" TIMESTAMP(3),
    "closingDate" TIMESTAMP(3),
    "chantierStartDate" TIMESTAMP(3),
    "receptionDate" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dossier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DossierContact" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "roleLabel" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DossierContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidenceInfo" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "operationName" TEXT,
    "typology" TEXT,
    "lotCount" INTEGER,
    "surfaceSquareMeters" DECIMAL(10,2),
    "levelsCount" INTEGER,
    "isOccupied" BOOLEAN,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResidenceInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChantierInfo" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "siteName" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "accessNotes" TEXT,
    "safetyNotes" TEXT,
    "expectedStartDate" TIMESTAMP(3),
    "expectedEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChantierInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminInfo" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "permitReference" TEXT,
    "permitFiledAt" TIMESTAMP(3),
    "permitGrantedAt" TIMESTAMP(3),
    "insurancePolicy" TEXT,
    "projectBudgetAmount" DECIMAL(12,2),
    "estimatedWorksAmount" DECIMAL(12,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 2,
    "createdByUserId" TEXT,
    "assignedToUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PLANNED',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "phase" "BusinessPhase",
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionFee" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "type" "MissionType" NOT NULL,
    "feeAmount" DECIMAL(12,2),
    "estimatedHours" DECIMAL(8,2),
    "hourlyRate" DECIMAL(10,2),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "missionFeeId" TEXT,
    "userId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "minutes" INTEGER NOT NULL,
    "competence" "Competence" NOT NULL,
    "note" TEXT,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "hourlyValue" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "invoiceNo" TEXT NOT NULL,
    "type" "InvoiceType" NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "label" TEXT NOT NULL,
    "notes" TEXT,
    "subtotalAmount" DECIMAL(12,2) NOT NULL,
    "vatAmount" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "missionFeeId" TEXT,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "dossierId" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'TRANSFER',
    "reference" TEXT,
    "payerName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAllocation" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "dossierId" TEXT,
    "invoiceId" TEXT,
    "paymentId" TEXT,
    "entityType" "ActivityEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "dossierId" TEXT,
    "invoiceId" TEXT,
    "paymentId" TEXT,
    "entityType" "AttachmentEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Membership_workspaceId_role_idx" ON "Membership"("workspaceId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_workspaceId_userId_key" ON "Membership"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Client_workspaceId_name_idx" ON "Client"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Client_workspaceId_clientCode_key" ON "Client"("workspaceId", "clientCode");

-- CreateIndex
CREATE INDEX "Contact_workspaceId_lastName_firstName_idx" ON "Contact"("workspaceId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "Contact_clientId_idx" ON "Contact"("clientId");

-- CreateIndex
CREATE INDEX "Dossier_workspaceId_status_phase_idx" ON "Dossier"("workspaceId", "status", "phase");

-- CreateIndex
CREATE INDEX "Dossier_clientId_idx" ON "Dossier"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Dossier_workspaceId_reference_key" ON "Dossier"("workspaceId", "reference");

-- CreateIndex
CREATE INDEX "DossierContact_contactId_idx" ON "DossierContact"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "DossierContact_dossierId_contactId_key" ON "DossierContact"("dossierId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "ResidenceInfo_dossierId_key" ON "ResidenceInfo"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "ChantierInfo_dossierId_key" ON "ChantierInfo"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminInfo_dossierId_key" ON "AdminInfo"("dossierId");

-- CreateIndex
CREATE INDEX "Task_dossierId_status_dueDate_idx" ON "Task"("dossierId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Task_workspaceId_status_idx" ON "Task"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Milestone_dossierId_status_dueDate_idx" ON "Milestone"("dossierId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Milestone_workspaceId_dueDate_idx" ON "Milestone"("workspaceId", "dueDate");

-- CreateIndex
CREATE INDEX "MissionFee_type_idx" ON "MissionFee"("type");

-- CreateIndex
CREATE UNIQUE INDEX "MissionFee_dossierId_type_key" ON "MissionFee"("dossierId", "type");

-- CreateIndex
CREATE INDEX "TimeEntry_dossierId_date_idx" ON "TimeEntry"("dossierId", "date");

-- CreateIndex
CREATE INDEX "TimeEntry_workspaceId_competence_date_idx" ON "TimeEntry"("workspaceId", "competence", "date");

-- CreateIndex
CREATE INDEX "TimeEntry_missionFeeId_idx" ON "TimeEntry"("missionFeeId");

-- CreateIndex
CREATE INDEX "Invoice_dossierId_status_idx" ON "Invoice"("dossierId", "status");

-- CreateIndex
CREATE INDEX "Invoice_workspaceId_issueDate_idx" ON "Invoice"("workspaceId", "issueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_workspaceId_invoiceNo_key" ON "Invoice"("workspaceId", "invoiceNo");

-- CreateIndex
CREATE INDEX "InvoiceLine_invoiceId_sortOrder_idx" ON "InvoiceLine"("invoiceId", "sortOrder");

-- CreateIndex
CREATE INDEX "InvoiceLine_missionFeeId_idx" ON "InvoiceLine"("missionFeeId");

-- CreateIndex
CREATE INDEX "Payment_workspaceId_receivedAt_idx" ON "Payment"("workspaceId", "receivedAt");

-- CreateIndex
CREATE INDEX "Payment_dossierId_idx" ON "Payment"("dossierId");

-- CreateIndex
CREATE INDEX "PaymentAllocation_invoiceId_idx" ON "PaymentAllocation"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAllocation_paymentId_invoiceId_key" ON "PaymentAllocation"("paymentId", "invoiceId");

-- CreateIndex
CREATE INDEX "ActivityEvent_workspaceId_createdAt_idx" ON "ActivityEvent"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityEvent_dossierId_createdAt_idx" ON "ActivityEvent"("dossierId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityEvent_invoiceId_createdAt_idx" ON "ActivityEvent"("invoiceId", "createdAt");

-- CreateIndex
CREATE INDEX "Attachment_workspaceId_entityType_entityId_idx" ON "Attachment"("workspaceId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Attachment_dossierId_idx" ON "Attachment"("dossierId");

-- CreateIndex
CREATE INDEX "Attachment_invoiceId_idx" ON "Attachment"("invoiceId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DossierContact" ADD CONSTRAINT "DossierContact_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DossierContact" ADD CONSTRAINT "DossierContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidenceInfo" ADD CONSTRAINT "ResidenceInfo_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChantierInfo" ADD CONSTRAINT "ChantierInfo_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInfo" ADD CONSTRAINT "AdminInfo_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionFee" ADD CONSTRAINT "MissionFee_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_missionFeeId_fkey" FOREIGN KEY ("missionFeeId") REFERENCES "MissionFee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_missionFeeId_fkey" FOREIGN KEY ("missionFeeId") REFERENCES "MissionFee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
