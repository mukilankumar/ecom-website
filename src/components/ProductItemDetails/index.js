// Write your code here
import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'

import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}
class ProductItemDetails extends Component {
  state = {
    productData: {},
    similarProductsData: [],
    apiStatus: apiStatusConstants.initial,
    quantity: 1,
  }

  componentDidMount() {
    this.getProductData()
  }

  getFormattedData = data => ({
    availability: data.availability,
    brand: data.brand,
    description: data.description,
    id: data.id,
    imageUrl: data.image_url,
    price: data.price,
    rating: data.rating,
    title: data.title,
    totalReviews: data.total_reviews,
  })

  getProductData = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params

    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const option = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, option)
    if (response.ok) {
      const data = await response.json()
      const updatedData = this.getFormattedData(data)
      const updatedSimilarProductData = data.similar_products.map(each =>
        this.getFormattedData(each),
      )
      this.setState({
        productData: updatedData,
        similarProductsData: updatedSimilarProductData,
        apiStatus: apiStatusConstants.success,
      })
    }
    if (response.status === 404) {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  renderLoadingView = () => (
    <div data-testid="loader" className="loader-container">
      <Loader type="ThreeDots" color="#0b69ff" height={80} width={80} />
    </div>
  )

  renderFailureView = () => (
    <div className="failure-view-container">
      <img
        className="failure-img"
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
      />
      <h1 className="failure-heading">Product Not Found</h1>
      <Link to="/products">
        <button className="failure-btn" type="button">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  onDecrementQuantity = () => {
    const {quantity} = this.state
    if (quantity > 1) {
      this.setState(prev => ({quantity: prev.quantity - 1}))
    }
  }

  onIncrementQuantity = () => {
    this.setState(prev => ({quantity: prev.quantity + 1}))
  }

  renderProductDetailsView = () => {
    const {productData, quantity, similarProductsData} = this.state
    const {
      availability,
      brand,
      description,
      imageUrl,
      price,
      rating,
      title,
      totalReviews,
    } = productData

    return (
      <div className="container">
        <div className="product-detail-container">
          <img className="product-img" src={imageUrl} alt="product" />
          <div className="detail-container">
            <h1 className="title">{title}</h1>
            <p className="price">RS {price}/- </p>
            <div className="rating-review-container">
              <div className="rating-container">
                <p className="rating">{rating}</p>
                <img
                  className="star"
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                />
              </div>
              <p className="review">{totalReviews} Reviews</p>
            </div>
            <p className="description">{description}</p>
            <div className="avail-container">
              <p className="brand">Available:</p>
              <p className="brand-value">{availability}</p>
            </div>
            <div className="brand-container">
              <p className="brand">Brand:</p>
              <p className="brand-value">{brand}</p>
            </div>
            <hr />
            <div className="quantity-container">
              <button
                type="button"
                onClick={this.onDecrementQuantity}
                data-testid="minus"
              >
                <BsDashSquare size={20} style={{border: 'none'}} />
              </button>
              <p className="quantity">{quantity}</p>
              <button
                type="button"
                onClick={this.onIncrementQuantity}
                data-testid="plus"
              >
                <BsPlusSquare size={20} style={{border: 'none'}} />
              </button>
            </div>
            <button className="cart-btn" type="button">
              ADD TO CART
            </button>
          </div>
        </div>
        <h1 className="similar-heading">Similar Products</h1>
        <ul className="similar-list">
          {similarProductsData.map(each => (
            <SimilarProductItem productDetails={each} key={each.id} />
          ))}
        </ul>
      </div>
    )
  }

  renderProductDetails = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProductDetailsView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div>{this.renderProductDetails()}</div>
      </>
    )
  }
}

export default ProductItemDetails
