export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count')) || 5;

  // Generate random hex colors
  const colors = Array.from({ length: count }, () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, '0')}`;
  });

  return Response.json({ colors });
} 