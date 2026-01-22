import { client } from '@/sanity/lib/client';
import { projectId, dataset } from '@/sanity/env';

export default async function DebugSanityPage() {
  // Fetch ALL products (no filter)
  const allProducts = await client.fetch(`
    *[_type == "product"] {
      _id,
      name,
      brand,
      model,
      category,
      inStock,
      price,
      "techSpecs": techSpecs,
      "imageUrl": mainImage.asset->url
    }
  `);

  // Fetch specific queries like calculator does
  const inverters = await client.fetch(`
    *[
      _type == "product" && 
      category == "inverter" && 
      inStock == true
    ] {
      _id,
      name,
      category,
      "capacity": techSpecs.capacity,
      inStock
    }
  `);

  const panels = await client.fetch(`
    *[
      _type == "product" && 
      category == "solar-panel" && 
      inStock == true
    ] {
      _id,
      name,
      category,
      "capacity": techSpecs.capacity,
      inStock
    }
  `);

  const batteries = await client.fetch(`
    *[
      _type == "product" && 
      category == "battery" && 
      inStock == true
    ] {
      _id,
      name,
      category,
      "capacity": techSpecs.capacity,
      inStock
    }
  `);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-red-700 mb-2">
          🚨 SANITY DEBUG PAGE
        </h1>
        <p className="text-red-600 font-medium">
          Emergency diagnostic for CMS data fetching issues
        </p>
      </div>

      {/* CONFIG INFO */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4">📡 Sanity Config</h2>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex gap-4">
            <span className="font-bold text-gray-700">Project ID:</span>
            <span className="text-blue-600">{projectId}</span>
          </div>
          <div className="flex gap-4">
            <span className="font-bold text-gray-700">Dataset:</span>
            <span className="text-blue-600">{dataset}</span>
          </div>
          <div className="flex gap-4">
            <span className="font-bold text-gray-700">API Version:</span>
            <span className="text-blue-600">{client.config().apiVersion}</span>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
          <div className="text-4xl font-bold text-purple-700">{allProducts.length}</div>
          <div className="text-sm text-purple-900 mt-1">Total Products</div>
        </div>
        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
          <div className="text-4xl font-bold text-green-700">{inverters.length}</div>
          <div className="text-sm text-green-900 mt-1">Inverters</div>
        </div>
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
          <div className="text-4xl font-bold text-yellow-700">{panels.length}</div>
          <div className="text-sm text-yellow-900 mt-1">Solar Panels</div>
        </div>
        <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
          <div className="text-4xl font-bold text-orange-700">{batteries.length}</div>
          <div className="text-sm text-orange-900 mt-1">Batteries</div>
        </div>
      </div>

      {/* CATEGORY ANALYSIS */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
        <h2 className="text-xl font-bold text-yellow-900 mb-4">🔍 Category Breakdown</h2>
        <div className="space-y-2">
          {Array.from(new Set(allProducts.map((p: any) => p.category))).map((cat: unknown) => {
            const categoryStr = String(cat)
            return (
              <div key={categoryStr || 'unknown'} className="flex justify-between items-center p-3 bg-white rounded border">
                <span className="font-mono text-sm">
                  category == "<span className="text-red-600 font-bold">{categoryStr || 'NULL'}</span>"
                </span>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {allProducts.filter((p: any) => p.category === cat).length} products
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* FILTERED QUERY RESULTS */}
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-900 mb-3">
            🔌 Inverters (category == "inverter" && inStock == true)
          </h3>
          <pre className="bg-white p-4 rounded border overflow-auto text-xs">
            {JSON.stringify(inverters, null, 2)}
          </pre>
        </div>

        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-900 mb-3">
            ☀️ Solar Panels (category == "solar-panel" && inStock == true)
          </h3>
          <pre className="bg-white p-4 rounded border overflow-auto text-xs">
            {JSON.stringify(panels, null, 2)}
          </pre>
        </div>

        <div className="bg-orange-50 border border-orange-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-orange-900 mb-3">
            🔋 Batteries (category == "battery" && inStock == true)
          </h3>
          <pre className="bg-white p-4 rounded border overflow-auto text-xs">
            {JSON.stringify(batteries, null, 2)}
          </pre>
        </div>
      </div>

      {/* RAW DATA DUMP */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🗃️ All Products (Raw JSON)</h2>
        <details>
          <summary className="cursor-pointer text-blue-600 font-semibold hover:text-blue-800">
            Click to expand full data dump ({allProducts.length} products)
          </summary>
          <pre className="bg-white p-4 rounded border overflow-auto text-xs mt-4 max-h-96">
            {JSON.stringify(allProducts, null, 2)}
          </pre>
        </details>
      </div>

      {/* DIAGNOSTIC CHECKS */}
      <div className="bg-red-50 border border-red-300 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-900 mb-4">⚠️ Diagnostic Checks</h2>
        <div className="space-y-3">
          {/* Check 1: Products exist */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {allProducts.length > 0 ? '✅' : '❌'}
            </span>
            <div>
              <div className="font-semibold">Products exist in CMS</div>
              <div className="text-sm text-gray-600">
                Found {allProducts.length} products
              </div>
            </div>
          </div>

          {/* Check 2: Category format */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {allProducts.some((p: any) => ['inverter', 'solar-panel', 'battery'].includes(p.category)) ? '✅' : '❌'}
            </span>
            <div>
              <div className="font-semibold">Category field format correct</div>
              <div className="text-sm text-gray-600">
                Looking for: "inverter", "solar-panel", "battery"
              </div>
            </div>
          </div>

          {/* Check 3: inStock field */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {allProducts.some((p: any) => p.inStock === true) ? '✅' : '❌'}
            </span>
            <div>
              <div className="font-semibold">inStock field exists and is true</div>
              <div className="text-sm text-gray-600">
                {allProducts.filter((p: any) => p.inStock === true).length} products in stock
              </div>
            </div>
          </div>

          {/* Check 4: techSpecs */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {allProducts.some((p: any) => p.techSpecs?.capacity) ? '✅' : '❌'}
            </span>
            <div>
              <div className="font-semibold">techSpecs.capacity exists</div>
              <div className="text-sm text-gray-600">
                {allProducts.filter((p: any) => p.techSpecs?.capacity).length} products have capacity
              </div>
            </div>
          </div>

          {/* Check 5: Images */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {allProducts.some((p: any) => p.imageUrl) ? '✅' : '⚠️'}
            </span>
            <div>
              <div className="font-semibold">Product images exist</div>
              <div className="text-sm text-gray-600">
                {allProducts.filter((p: any) => p.imageUrl).length} products have images
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      {inverters.length === 0 && allProducts.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-6">
          <h2 className="text-xl font-bold text-orange-900 mb-4">💡 Possible Issues</h2>
          <ul className="list-disc list-inside space-y-2 text-orange-800">
            <li>
              <strong>Category mismatch:</strong> Check if products have category "inverter" (lowercase) 
              vs "Inverter" (capitalized)
            </li>
            <li>
              <strong>inStock field:</strong> Check if inStock is set to true in Sanity Studio
            </li>
            <li>
              <strong>Field names:</strong> Verify techSpecs object exists with capacity field
            </li>
            <li>
              <strong>Stale cache:</strong> Try republishing products in Sanity Studio
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
