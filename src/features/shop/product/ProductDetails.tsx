import type { MerchProduct, ModelInfo } from '../merch'

interface ProductDetailsProps {
  details: MerchProduct['details']
  model?: ModelInfo
}

/** The product's detail notes (fabric, fit…) and, when photographed on a model, the model's measurements. */
export function ProductDetails({ details, model }: ProductDetailsProps) {
  return (
    <>
      {details.map((d) => (
        <div key={d.label} className="pdp-detail">
          <div className="sq-label pdp-detail-label">{d.label}</div>
          <p className="mb-0">{d.text}</p>
        </div>
      ))}
      {model && (
        <div className="pdp-detail">
          <div className="sq-label pdp-detail-label">Model</div>
          <dl className="pdp-model">
            <div>
              <dt>Height:</dt>
              <dd>{model.height}</dd>
            </div>
            <div>
              <dt>Weight:</dt>
              <dd>{model.weight}</dd>
            </div>
            <div>
              <dt>Wearing size:</dt>
              <dd>{model.size}</dd>
            </div>
          </dl>
        </div>
      )}
    </>
  )
}
