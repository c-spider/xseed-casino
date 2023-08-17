import axios from "axios"

class ClientApi {
  constructor() {
    this.URI = "/api"
  }

  async getRounds(wallet) {
    try {
      const res = await axios.post(`${this.URI}/rounds`, {wallet})
      return res.data
    } catch (e) {
      return {
        data: [],
        pending: [],
      }
    }
  }

  async getRequests(roundId) {
    try {
      const res = await axios.get(`${this.URI}/buyRequests?roundId=${roundId}`)
      return res.data
    } catch (e) {
      return []
    }
  }

  async startRound(roundId) {
    try {
      const res = await axios.post(`${this.URI}/startRound`, {roundId})
      return res.data
    } catch (e) {
      return []
    }
  }

  async completeRound(roundId) {
    try {
      const res = await axios.post(`${this.URI}/completeRound`, {roundId})
      return res.data
    } catch (e) {
      return []
    }
  }

  async buyTicket(count, roundId, wallet, paymentCoin) {
    try {
      const res = await axios.post(`${this.URI}/buyTicket`, {count, roundId, wallet, paymentCoin})
      return res.data.values
    } catch (e) {
      if(e?.response?.status == 409)
        return {hasPending: true};
      else
        return []
    }
  }


}

const CLIENT_API =  new ClientApi()
export default CLIENT_API;