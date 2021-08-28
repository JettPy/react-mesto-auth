import React from 'react';
import api from '../utils/api.js';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import PopupWithForm from './PopupWithForm';
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";

function App() {

  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState({});
  const [currentUser, setCurrentUser] = React.useState({});
  const [cards, setCards] = React.useState([]);
  
  React.useEffect(() => { // Запросы к серверу за данными пользователя и карточек
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then((results) => {
        const [user, cards] = results;
        setCurrentUser(user);
        setCards(cards);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleEditAvatarClick = () => { // Обработчик кнопки редактирования аватара
    setIsEditAvatarPopupOpen(true);
  };

  const handleUpdateAvatar = (avatar) => { // Обработчик обнавления аватара пользователя
    api.updateAvatar(avatar)
      .then((result) => {
        setCurrentUser(result);
        closeAllPopups();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleEditProfileClick = () => { // Обработчик кнопки редактирования профиля
    setIsEditProfilePopupOpen(true);
  };

  const handleUpdateUser = (userData) => { // Обработчик обнавления данных пользователя
    api.updateUserInfo(userData.name, userData.about)
      .then((result) => {
        setCurrentUser(result);
        closeAllPopups();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleAddPlaceClick = () => { // Обработчик кнопки добавления карточки
    setIsAddPlacePopupOpen(true);
  };

  const handleAddPlace = (name, link) => { // Обработчик добавления карточки
    api.addCard(name, link)
      .then((result) => {
        setCards([result, ...cards]);
        closeAllPopups();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleCardClick = (card) => { // Обработчик нажатия на карточку
    setSelectedCard(card);
    setIsImagePopupOpen(true);
  };

  function handleCardLike(card) { // Обработчик лайка картчки
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    if (isLiked) {
      api.dislike(card._id).then((newCard) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
      });
    } else {
      api.like(card._id).then((newCard) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
      });
    }
  }

  function handleCardDelete(card) { // Обработчик удаления картчки
    api.deleteCard(card._id).then(() => {
      setCards(cards.filter((c) => c._id !== card._id));
    });
  }

  const closeAllPopups = () => { // Закрытие всех попапов
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsImagePopupOpen(false);
    setSelectedCard({});
  };

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <Header />
      <Main onEditProfile={handleEditProfileClick} onAddPlace={handleAddPlaceClick} onEditAvatar={handleEditAvatarClick} onCardClick={handleCardClick} cards={cards} onCardLike={handleCardLike} onCardDelete={handleCardDelete} />
      <Footer />
      <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser}/>
      <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlace} />
      <ImagePopup card={selectedCard} name="image" isOpen={isImagePopupOpen} onClose={closeAllPopups} />
      <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />
      <PopupWithForm title="Вы уверены?" name="delete" isOpen={false} buttonText="Да" onClose={closeAllPopups} />
    </CurrentUserContext.Provider>
  );
}

export default App;
