export default defineEventHandler(async () => {
  const prisma = usePrisma();
  return await prisma.profile.findMany({
    orderBy: { createdAt: 'asc' },
  });
});
