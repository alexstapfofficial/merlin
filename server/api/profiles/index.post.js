export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body?.name) {
    throw createError({ statusCode: 400, statusMessage: 'name is required' });
  }

  const prisma = usePrisma();
  return await prisma.profile.create({
    data: {
      name: body.name,
      birthdate: body.birthdate ?? {},
      birthtime: body.birthtime ?? {},
      coordinates: body.coordinates ?? [],
      isOwner: body.isOwner ?? false,
    },
  });
});
