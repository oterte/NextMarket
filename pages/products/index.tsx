import { products } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";

const Take = 9;

function Products() {
  const [skip, setSkip] = useState(0);
  const [products, setProducts] = useState<products[]>([]);

  useEffect(() => {
    fetch(`/api/get-products?skip=0&take=${Take}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.items));
  }, []);
  return (
    <div>
      {products &&
        products.map((item) => (
          <div key={item.id}>
            <Image
              src={item.image_url ?? ""}
              alt={item.name}
              width={300}
              height={200}
            />
            {item.name}
          </div>
        ))}
    </div>
  );
}

export default Products;
