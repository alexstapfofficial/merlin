export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const searchText = (query.text || '').toString().trim();

  if (!searchText) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Search text is required'
    });
  }

  try {
    const prisma = usePrisma();

    // Numeric input is treated as a postal code (PLZ), everything else as a
    // place name. Both columns are indexed (plz btree, name GIN trigram).
    const isPlz = /^\d+$/.test(searchText);
    const where = isPlz
      ? { plz: { startsWith: searchText } }
      : { name: { startsWith: searchText, mode: 'insensitive' } };

    const rows = await prisma.places.findMany({
      where,
      take: 10,
      // Collapse identical place names (one row per PLZ) to a single suggestion
      // when searching by name; keep PLZ results as-is.
      distinct: isPlz ? undefined : ['name'],
      orderBy: [{ name: 'asc' }, { plz: 'asc' }]
    });

    const predictions = rows.map((row) => ({
      description: `${row.name} (${row.plz})${row.bundesland ? ', ' + row.bundesland : ''}`,
      // BigInt ids are not JSON-serialisable, expose as string.
      place_id: row.id.toString(),
      // [longitude, latitude] to match the existing coordinate format.
      coordinates: [row.longitude, row.latitude]
    }));

    return { predictions };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch geocoding data'
    });
  }
});
