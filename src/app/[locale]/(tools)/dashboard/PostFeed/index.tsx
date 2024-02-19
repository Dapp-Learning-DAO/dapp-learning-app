
async function getData(): Promise<number[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }, 3000);
  });
}

export default async function PostFeed() {
  const data = await getData();

  return (
    <div className="max-w-xl my-16 mx-auto card border">
      {data.map((row) => (
        <div key={row} className="grid grid-cols-2 p-8">
          <div>row</div>
          <div>{row}</div>
        </div>
      ))}
    </div>
  );
}