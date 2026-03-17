import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { env } from "../src/lib/env";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: env.databaseUrl(),
  }),
});

function money(value: number) {
  return value.toFixed(2);
}

async function clearDatabase() {
  await prisma.$transaction([
    prisma.attachment.deleteMany(),
    prisma.activityEvent.deleteMany(),
    prisma.paymentAllocation.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.invoiceLine.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.timeEntry.deleteMany(),
    prisma.milestone.deleteMany(),
    prisma.task.deleteMany(),
    prisma.missionFee.deleteMany(),
    prisma.adminInfo.deleteMany(),
    prisma.chantierInfo.deleteMany(),
    prisma.residenceInfo.deleteMany(),
    prisma.dossierContact.deleteMany(),
    prisma.dossier.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.client.deleteMany(),
    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
    prisma.membership.deleteMany(),
    prisma.user.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.workspace.deleteMany(),
  ]);
}

async function main() {
  await clearDatabase();

  const workspace = await prisma.workspace.create({
    data: {
      name: "3AJ Atelier",
      slug: "3aj-atelier",
      currency: "EUR",
      locale: "fr-FR",
      timezone: "Europe/Paris",
    },
  });

  const defaultPasswordHash = await hashPassword("PulseDemo2026!");

  const [owner, manager, finance, member] = await Promise.all([
    prisma.user.create({
      data: {
        email: "julien@3ajpulse.fr",
        name: "Julien Martin",
        passwordHash: defaultPasswordHash,
        workspaceId: workspace.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "sarah@3ajpulse.fr",
        name: "Sarah Lefevre",
        passwordHash: defaultPasswordHash,
        workspaceId: workspace.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "finance@3ajpulse.fr",
        name: "Claire Bernard",
        passwordHash: defaultPasswordHash,
        workspaceId: workspace.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "production@3ajpulse.fr",
        name: "Thomas Dubois",
        passwordHash: defaultPasswordHash,
        workspaceId: workspace.id,
      },
    }),
  ]);

  await prisma.membership.createMany({
    data: [
      { workspaceId: workspace.id, userId: owner.id, role: "OWNER", isDefault: true },
      { workspaceId: workspace.id, userId: manager.id, role: "MANAGER", isDefault: true },
      { workspaceId: workspace.id, userId: finance.id, role: "FINANCE", isDefault: true },
      { workspaceId: workspace.id, userId: member.id, role: "MEMBER", isDefault: true },
    ],
  });

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        workspaceId: workspace.id,
        name: "SCI Les Terrasses",
        legalName: "SCI Les Terrasses",
        clientCode: "CL-001",
        email: "contact@lesterrasses.fr",
        phone: "04 72 00 00 01",
        siren: "894512301",
        billingAddress: "18 rue du Parc, 69006 Lyon",
      },
    }),
    prisma.client.create({
      data: {
        workspaceId: workspace.id,
        name: "Promo Nord SAS",
        legalName: "Promo Nord SAS",
        clientCode: "CL-002",
        email: "direction@promonord.fr",
        phone: "03 20 10 20 30",
        siren: "512345678",
        billingAddress: "22 avenue Foch, 59000 Lille",
      },
    }),
    prisma.client.create({
      data: {
        workspaceId: workspace.id,
        name: "Ville de Lyon",
        legalName: "Ville de Lyon",
        clientCode: "CL-003",
        email: "urbanisme@lyon.fr",
        phone: "04 72 10 30 40",
        billingAddress: "1 place de la Comedie, 69001 Lyon",
      },
    }),
  ]);

  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        workspaceId: workspace.id,
        clientId: clients[0].id,
        firstName: "Celine",
        lastName: "Roux",
        roleLabel: "Gerante",
        email: "celine.roux@lesterrasses.fr",
        mobilePhone: "06 11 22 33 44",
        isPrimary: true,
      },
    }),
    prisma.contact.create({
      data: {
        workspaceId: workspace.id,
        clientId: clients[1].id,
        firstName: "Marc",
        lastName: "Delaunay",
        roleLabel: "Directeur programmes",
        email: "marc.delaunay@promonord.fr",
        mobilePhone: "06 55 12 45 78",
        isPrimary: true,
      },
    }),
    prisma.contact.create({
      data: {
        workspaceId: workspace.id,
        clientId: clients[2].id,
        firstName: "Anne",
        lastName: "Giraud",
        roleLabel: "Cheffe de projet patrimoine",
        email: "anne.giraud@lyon.fr",
        mobilePhone: "06 20 30 40 50",
        isPrimary: true,
      },
    }),
  ]);

  const dossierA = await prisma.dossier.create({
    data: {
      workspaceId: workspace.id,
      clientId: clients[0].id,
      reference: "DOS-2026-001",
      title: "Residence Les Terrasses",
      description: "Construction d'une residence de 18 logements collectifs.",
      status: "ACTIVE",
      phase: "LCA",
      city: "Lyon",
      postalCode: "69006",
      addressLine1: "18 rue du Parc",
      projectLabel: "Programme logements premium",
      startDate: new Date("2026-01-15"),
      notes: "Operation prioritaire pour le premier semestre.",
      contacts: {
        create: [{ contactId: contacts[0].id, roleLabel: "Maitre d'ouvrage", isPrimary: true }],
      },
      residenceInfo: {
        create: {
          operationName: "Residence Les Terrasses",
          typology: "Collectif neuf",
          lotCount: 18,
          surfaceSquareMeters: money(1450),
          levelsCount: 5,
          isOccupied: false,
        },
      },
      chantierInfo: {
        create: {
          siteName: "Parcelle B14",
          addressLine1: "18 rue du Parc",
          postalCode: "69006",
          city: "Lyon",
          expectedStartDate: new Date("2026-09-01"),
          expectedEndDate: new Date("2027-12-20"),
        },
      },
      adminInfo: {
        create: {
          permitReference: "PC-69006-2026-18",
          permitFiledAt: new Date("2026-02-10"),
          projectBudgetAmount: money(2100000),
          estimatedWorksAmount: money(1650000),
        },
      },
      missions: {
        create: [
          { type: "LCA", feeAmount: money(18000), estimatedHours: money(140), hourlyRate: money(120) },
          { type: "LCMP", feeAmount: money(22000), estimatedHours: money(160), hourlyRate: money(130) },
          { type: "LCSC", feeAmount: money(12000), estimatedHours: money(90), hourlyRate: money(125) },
        ],
      },
    },
    include: { missions: true },
  });

  const dossierB = await prisma.dossier.create({
    data: {
      workspaceId: workspace.id,
      clientId: clients[1].id,
      reference: "DOS-2026-002",
      title: "Bureaux ZAC Nord",
      description: "Restructuration et extension de bureaux tertiaires.",
      status: "ACTIVE",
      phase: "LCMP",
      city: "Lille",
      postalCode: "59000",
      addressLine1: "22 avenue Foch",
      projectLabel: "Immeuble tertiaire ZAC Nord",
      startDate: new Date("2025-11-03"),
      contacts: {
        create: [{ contactId: contacts[1].id, roleLabel: "Directeur programme", isPrimary: true }],
      },
      adminInfo: {
        create: {
          permitReference: "AT-59000-2025-88",
          permitGrantedAt: new Date("2025-12-12"),
          projectBudgetAmount: money(980000),
          estimatedWorksAmount: money(740000),
        },
      },
      missions: {
        create: [
          { type: "LCA", feeAmount: money(9500), estimatedHours: money(75), hourlyRate: money(115) },
          { type: "LCMP", feeAmount: money(14500), estimatedHours: money(110), hourlyRate: money(125) },
        ],
      },
    },
    include: { missions: true },
  });

  const dossierC = await prisma.dossier.create({
    data: {
      workspaceId: workspace.id,
      clientId: clients[2].id,
      reference: "DOS-2026-003",
      title: "Rehabilitation immeuble historique",
      description: "Mission sur patrimoine existant avec suivi de chantier imminent.",
      status: "DORMANT",
      phase: "CHANTIER",
      city: "Lyon",
      postalCode: "69001",
      addressLine1: "12 rue des Augustins",
      projectLabel: "Patrimoine centre-ville",
      startDate: new Date("2025-08-18"),
      contacts: {
        create: [{ contactId: contacts[2].id, roleLabel: "Collectivite", isPrimary: true }],
      },
      chantierInfo: {
        create: {
          siteName: "Immeuble Augustins",
          addressLine1: "12 rue des Augustins",
          postalCode: "69001",
          city: "Lyon",
          safetyNotes: "Acces controle, contraintes monument historique.",
          expectedStartDate: new Date("2026-05-01"),
          expectedEndDate: new Date("2027-02-15"),
        },
      },
      missions: {
        create: [
          { type: "LCA", feeAmount: money(7200), estimatedHours: money(55), hourlyRate: money(120) },
          { type: "LCSC", feeAmount: money(16400), estimatedHours: money(130), hourlyRate: money(126) },
        ],
      },
    },
    include: { missions: true },
  });

  await prisma.task.createMany({
    data: [
      {
        workspaceId: workspace.id,
        dossierId: dossierA.id,
        title: "Valider esquisse logement T3",
        status: "IN_PROGRESS",
        dueDate: new Date("2026-03-25"),
        createdByUserId: owner.id,
        assignedToUserId: member.id,
      },
      {
        workspaceId: workspace.id,
        dossierId: dossierA.id,
        title: "Consolider budget MOA",
        status: "TODO",
        dueDate: new Date("2026-03-29"),
        createdByUserId: manager.id,
        assignedToUserId: finance.id,
      },
      {
        workspaceId: workspace.id,
        dossierId: dossierB.id,
        title: "Préparer dossier DCE",
        status: "IN_PROGRESS",
        dueDate: new Date("2026-04-04"),
        createdByUserId: manager.id,
        assignedToUserId: member.id,
      },
      {
        workspaceId: workspace.id,
        dossierId: dossierC.id,
        title: "Mettre à jour planning chantier",
        status: "BLOCKED",
        dueDate: new Date("2026-03-30"),
        createdByUserId: owner.id,
        assignedToUserId: manager.id,
      },
    ],
  });

  await prisma.milestone.createMany({
    data: [
      {
        workspaceId: workspace.id,
        dossierId: dossierA.id,
        title: "APS",
        status: "IN_PROGRESS",
        dueDate: new Date("2026-04-15"),
        phase: "LCA",
        sortOrder: 1,
      },
      {
        workspaceId: workspace.id,
        dossierId: dossierA.id,
        title: "Depot permis",
        status: "PLANNED",
        dueDate: new Date("2026-05-20"),
        phase: "LCMP",
        sortOrder: 2,
      },
      {
        workspaceId: workspace.id,
        dossierId: dossierB.id,
        title: "DCE",
        status: "PLANNED",
        dueDate: new Date("2026-04-05"),
        phase: "LCMP",
        sortOrder: 1,
      },
      {
        workspaceId: workspace.id,
        dossierId: dossierC.id,
        title: "Ordre de service chantier",
        status: "PLANNED",
        dueDate: new Date("2026-04-18"),
        phase: "CHANTIER",
        sortOrder: 1,
      },
    ],
  });

  await prisma.timeEntry.createMany({
    data: [
      {
        workspaceId: workspace.id,
        dossierId: dossierA.id,
        missionFeeId: dossierA.missions[0]?.id,
        userId: member.id,
        date: new Date("2026-03-12"),
        minutes: 240,
        competence: "ARCHITECTURE",
        note: "Production plans niveau 2",
        billable: true,
        hourlyValue: money(118),
      },
      {
        workspaceId: workspace.id,
        dossierId: dossierA.id,
        missionFeeId: dossierA.missions[0]?.id,
        userId: owner.id,
        date: new Date("2026-03-13"),
        minutes: 90,
        competence: "PROJECT_PILOTAGE",
        note: "Reunion MOA",
        billable: true,
        hourlyValue: money(145),
      },
      {
        workspaceId: workspace.id,
        dossierId: dossierB.id,
        missionFeeId: dossierB.missions[1]?.id,
        userId: member.id,
        date: new Date("2026-03-14"),
        minutes: 210,
        competence: "DESSINATEUR",
        note: "Mise au propre DCE",
        billable: true,
        hourlyValue: money(96),
      },
      {
        workspaceId: workspace.id,
        dossierId: dossierC.id,
        missionFeeId: dossierC.missions[1]?.id,
        userId: manager.id,
        date: new Date("2026-03-10"),
        minutes: 120,
        competence: "MAITRE_OEUVRE",
        note: "Visite de site et coordination",
        billable: true,
        hourlyValue: money(132),
      },
    ],
  });

  const invoiceA1 = await prisma.invoice.create({
    data: {
      workspaceId: workspace.id,
      dossierId: dossierA.id,
      createdByUserId: finance.id,
      invoiceNo: "FAC-2026-001",
      type: "DEPOSIT",
      status: "SENT",
      issueDate: new Date("2026-03-01"),
      sentAt: new Date("2026-03-02"),
      dueDate: new Date("2026-03-20"),
      currency: "EUR",
      label: "Acompte mission LCA",
      subtotalAmount: money(5000),
      vatAmount: money(1000),
      totalAmount: money(6000),
      lines: {
        create: [
          {
            missionFeeId: dossierA.missions[0]?.id,
            label: "Acompte LCA",
            quantity: money(1),
            unitPrice: money(5000),
            vatRate: money(20),
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const invoiceB1 = await prisma.invoice.create({
    data: {
      workspaceId: workspace.id,
      dossierId: dossierB.id,
      createdByUserId: finance.id,
      invoiceNo: "FAC-2026-002",
      type: "INTERMEDIATE",
      status: "PAID",
      issueDate: new Date("2026-02-15"),
      sentAt: new Date("2026-02-16"),
      dueDate: new Date("2026-03-01"),
      paidAt: new Date("2026-02-28"),
      currency: "EUR",
      label: "Situation mission LCMP",
      subtotalAmount: money(8200),
      vatAmount: money(1640),
      totalAmount: money(9840),
      lines: {
        create: [
          {
            missionFeeId: dossierB.missions[1]?.id,
            label: "Avancement LCMP",
            quantity: money(1),
            unitPrice: money(8200),
            vatRate: money(20),
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const invoiceC1 = await prisma.invoice.create({
    data: {
      workspaceId: workspace.id,
      dossierId: dossierC.id,
      createdByUserId: finance.id,
      invoiceNo: "FAC-2026-003",
      type: "TIME_BASED",
      status: "PARTIALLY_PAID",
      issueDate: new Date("2026-02-25"),
      sentAt: new Date("2026-02-26"),
      dueDate: new Date("2026-03-12"),
      currency: "EUR",
      label: "Temps passe chantier",
      subtotalAmount: money(4200),
      vatAmount: money(840),
      totalAmount: money(5040),
      lines: {
        create: [
          {
            missionFeeId: dossierC.missions[1]?.id,
            label: "Suivi chantier fevrier",
            quantity: money(28),
            unitPrice: money(150),
            vatRate: money(20),
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const paymentA = await prisma.payment.create({
    data: {
      workspaceId: workspace.id,
      dossierId: dossierA.id,
      receivedAt: new Date("2026-03-18"),
      amount: money(3000),
      method: "TRANSFER",
      reference: "VIR-LT-0318",
      payerName: "SCI Les Terrasses",
      allocations: {
        create: [{ invoiceId: invoiceA1.id, amount: money(3000) }],
      },
    },
  });

  const paymentB = await prisma.payment.create({
    data: {
      workspaceId: workspace.id,
      dossierId: dossierB.id,
      receivedAt: new Date("2026-02-28"),
      amount: money(9840),
      method: "TRANSFER",
      reference: "VIR-PN-0228",
      payerName: "Promo Nord SAS",
      allocations: {
        create: [{ invoiceId: invoiceB1.id, amount: money(9840) }],
      },
    },
  });

  const paymentC = await prisma.payment.create({
    data: {
      workspaceId: workspace.id,
      dossierId: dossierC.id,
      receivedAt: new Date("2026-03-15"),
      amount: money(2520),
      method: "CHEQUE",
      reference: "CHQ-LYON-0315",
      payerName: "Ville de Lyon",
      allocations: {
        create: [{ invoiceId: invoiceC1.id, amount: money(2520) }],
      },
    },
  });

  await prisma.activityEvent.createMany({
    data: [
      {
        workspaceId: workspace.id,
        actorUserId: owner.id,
        dossierId: dossierA.id,
        entityType: "DOSSIER",
        entityId: dossierA.id,
        action: "dossier.created",
        description: "Création du dossier Résidence Les Terrasses",
      },
      {
        workspaceId: workspace.id,
        actorUserId: manager.id,
        dossierId: dossierB.id,
        entityType: "DOSSIER",
        entityId: dossierB.id,
        action: "dossier.created",
        description: "Création du dossier Bureaux ZAC Nord",
      },
      {
        workspaceId: workspace.id,
        actorUserId: finance.id,
        dossierId: dossierA.id,
        invoiceId: invoiceA1.id,
        entityType: "INVOICE",
        entityId: invoiceA1.id,
        action: "invoice.created",
        description: "Création de la facture FAC-2026-001",
      },
      {
        workspaceId: workspace.id,
        actorUserId: finance.id,
        dossierId: dossierA.id,
        invoiceId: invoiceA1.id,
        entityType: "INVOICE",
        entityId: invoiceA1.id,
        action: "invoice.sent",
        description: "Émission de la facture FAC-2026-001",
      },
      {
        workspaceId: workspace.id,
        actorUserId: finance.id,
        dossierId: dossierB.id,
        paymentId: paymentB.id,
        entityType: "PAYMENT",
        entityId: paymentB.id,
        action: "payment.received",
        description: "Paiement intégral reçu pour FAC-2026-002",
      },
      {
        workspaceId: workspace.id,
        actorUserId: manager.id,
        dossierId: dossierC.id,
        paymentId: paymentC.id,
        entityType: "PAYMENT",
        entityId: paymentC.id,
        action: "payment.received",
        description: "Paiement partiel reçu pour FAC-2026-003",
      },
      {
        workspaceId: workspace.id,
        actorUserId: member.id,
        dossierId: dossierA.id,
        entityType: "DOSSIER",
        entityId: dossierA.id,
        action: "dossier.updated",
        description: "Mise à jour des informations du dossier Résidence Les Terrasses",
      },
    ],
  });

  await prisma.attachment.createMany({
    data: [
      {
        workspaceId: workspace.id,
        dossierId: dossierA.id,
        entityType: "DOSSIER",
        entityId: dossierA.id,
        fileName: "programme-terrasses.pdf",
        mimeType: "application/pdf",
        fileSize: 248000,
        storageKey: "demo/dossiers/programme-terrasses.pdf",
      },
      {
        workspaceId: workspace.id,
        invoiceId: invoiceA1.id,
        entityType: "INVOICE",
        entityId: invoiceA1.id,
        fileName: "fac-2026-001.pdf",
        mimeType: "application/pdf",
        fileSize: 124500,
        storageKey: "demo/invoices/fac-2026-001.pdf",
      },
      {
        workspaceId: workspace.id,
        paymentId: paymentA.id,
        entityType: "PAYMENT",
        entityId: paymentA.id,
        fileName: "preuve-virement-lt.pdf",
        mimeType: "application/pdf",
        fileSize: 88000,
        storageKey: "demo/payments/preuve-virement-lt.pdf",
      },
    ],
  });

  console.log("Seed terminé.");
  console.log("Workspace:", workspace.slug);
  console.log("Utilisateur owner:", owner.email);
  console.log("Mot de passe demo: PulseDemo2026!");
  console.log("");
  console.log("Comptes disponibles:");
  console.log("  - julien@3ajpulse.fr (Owner)");
  console.log("  - sarah@3ajpulse.fr (Manager)");
  console.log("  - finance@3ajpulse.fr (Finance)");
  console.log("  - production@3ajpulse.fr (Member)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
