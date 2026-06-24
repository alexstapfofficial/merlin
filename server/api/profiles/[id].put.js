export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  const prisma = usePrisma();
  return await prisma.profile.update({
    where: { id },
    data: {
      name: body.name,
      birthdate: body.birthdate ?? {},
      birthtime: body.birthtime ?? {},
      coordinates: body.coordinates ?? [],
    },
  });
});
