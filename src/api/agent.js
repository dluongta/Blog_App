import axios from 'axios';

const API_ROOT = 'https://conduit.productionready.io/api';

const responseBody = (response) => response.data;

const requests = {
  get: (url) => axios.get(`${API_ROOT}${url}`).then(responseBody),
  post: (url, body) => axios.post(`${API_ROOT}${url}`, body).then(responseBody),
  put: (url, body) => axios.put(`${API_ROOT}${url}`, body).then(responseBody),
  del: (url) => axios.delete(`${API_ROOT}${url}`).then(responseBody)
};

const Articles = {
  all: () => requests.get('/articles?limit=10&offset=0'),
  byAuthor: (author) => requests.get(`/articles?author=${author}`),
  byTag: (tag) => requests.get(`/articles?tag=${tag}`),
  del: (slug) => requests.del(`/articles/${slug}`),
  favorite: (slug) => requests.post(`/articles/${slug}/favorite`),
  favoritedBy: (author) => requests.get(`/articles?favorited=${author}`),
  feed: () => requests.get('/articles/feed?limit=10&offset=0'),
  get: (slug) => requests.get(`/articles/${slug}`),
  unfavorite: (slug) => requests.del(`/articles/${slug}/favorite`),
  update: (article) => requests.put(`/articles/${article.slug}`, { article }),
  create: (article) => requests.post('/articles', { article })
};

const Auth = {
  current: () => requests.get('/user'),
  login: (email, password) => requests.post('/users/login', { user: { email, password } }),
  register: (username, email, password) => requests.post('/users', { user: { username, email, password } }),
  save: (user) => requests.put('/user', { user })
};

const Comments = {
  create: (slug, comment) => requests.post(`/articles/${slug}/comments`, { comment }),
  delete: (slug, commentId) => requests.del(`/articles/${slug}/comments/${commentId}`),
  forArticle: (slug) => requests.get(`/articles/${slug}/comments`)
};

const Profile = {
  follow: (username) => requests.post(`/profiles/${username}/follow`),
  get: (username) => requests.get(`/profiles/${username}`),
  unfollow: (username) => requests.del(`/profiles/${username}/follow`)
};

export default {
  Articles,
  Auth,
  Comments,
  Profile
};
