import { prisma } from "@/lib/db";
import {
  clientSchema,
  contactSchema,
  type ClientInput,
  type ContactInput,
} from "@/features/clients/validation/client-schemas";

export async function listClients(workspaceId: string) {
  return prisma.client.findMany({
    where: { workspaceId },
    include: {
      contacts: {
        orderBy: [{ isPrimary: "desc" }, { lastName: "asc" }],
      },
      _count: {
        select: {
          dossiers: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getClientById(workspaceId: string, clientId: string) {
  return prisma.client.findFirst({
    where: {
      id: clientId,
      workspaceId,
    },
    include: {
      contacts: {
        orderBy: [{ isPrimary: "desc" }, { lastName: "asc" }],
      },
      dossiers: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}

export async function createClient(workspaceId: string, input: ClientInput) {
  const validatedInput = clientSchema.parse(input);

  return prisma.client.create({
    data: {
      workspaceId,
      ...validatedInput,
      email: validatedInput.email || null,
      website: validatedInput.website || null,
    },
  });
}

export async function createContact(workspaceId: string, input: ContactInput) {
  const validatedInput = contactSchema.parse(input);

  return prisma.contact.create({
    data: {
      workspaceId,
      ...validatedInput,
      email: validatedInput.email || null,
    },
  });
}
