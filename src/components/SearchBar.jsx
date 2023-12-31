import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import RecipeContext from '../context/RecipeContext';
import { cockTailAPI, mealAPI } from '../helpers/APIsHandle';
import '../css/SearchBar.css';

function SearchBar() {
  const { recipes, setRecipes } = useContext(RecipeContext); // armazena as receitas que devem ser renderizadas
  const [fetchedData, setFetchedData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // armazena o texto a ser buscado na API
  const [searchByType, setSearchByType] = useState('ingredient'); // armazena o filtro por tipo: ingredient, name ou firstLetter
  const { setIsLoading } = useContext(RecipeContext); // declaração de estado global para renderização da msg de Loading
  const location = useLocation();
  const history = useHistory();

  const handleChange = ({ target: { type, value } }) => {
    if (type === 'text') setSearchTerm(value);
    else setSearchByType(value);
  }; // controla os elementos de Input de texto e Radio buttons

  const getRecipes = async () => {
    let endpoint = '';
    switch (searchByType) {
    case 'ingredient':
      endpoint = `filter.php?i=${searchTerm}`;
      break;
    case 'name':
      endpoint = `search.php?s=${searchTerm}`;
      break;
    default:
      endpoint = `search.php?f=${searchTerm}`;
    }

    if (searchByType === 'firstLetter' && searchTerm.length > 1) {
      global.alert('Your search must have only 1 (one) character');
    } else {
      setIsLoading(true);
      let dataFetched = [];
      if (location.pathname === '/meals') {
        const apiData = await mealAPI(endpoint);
        dataFetched = apiData.meals;
      } else {
        const apiData = await cockTailAPI(endpoint);
        dataFetched = apiData.drinks;
      }
      setFetchedData(dataFetched);
      setIsLoading(false);
    }
  }; // realiza o fetch e atualiza o estado fetchedData com array contendo as receitas filtradas

  useEffect(() => {
    const id = location.pathname === '/meals' ? 'idMeal' : 'idDrink';
    if (fetchedData && fetchedData.length === 1) {
      history.push(`${location.pathname}/${fetchedData[0][id]}`);
    } else if (fetchedData) {
      const maxIndex = 12;
      const recipesList = fetchedData.slice(0, maxIndex);
      setRecipes(recipesList);
    } else setRecipes(null); // teste não passa
  }, [fetchedData, history, location.pathname, setRecipes]); // precisava chamar esses valores

  useEffect(() => {
    if (recipes === null) { // teste não passa
      global.alert('Sorry, we haven\'t found any recipes for these filters.');
    }
  }, [recipes]);

  return (
    <form className="search-container">
      <section className="search-input">
        <input
          type="text"
          data-testid="search-input"
          placeholder="Search"
          value={ searchTerm }
          onChange={ handleChange }
          id="search-input"
        />
      </section>

      <section className="search-options">
        <div className="search-radio-buttons">
          <input
            type="radio"
            data-testid="ingredient-search-radio"
            value="ingredient"
            id="ingredient"
            name="searchByType"
            onChange={ handleChange }
          />
          <label htmlFor="ingredient">Ingredient</label>
          <input
            type="radio"
            data-testid="name-search-radio"
            value="name"
            id="name"
            name="searchByType"
            onChange={ handleChange }
          />
          <label htmlFor="name">Name</label>
          <input
            type="radio"
            data-testid="first-letter-search-radio"
            value="firstLetter"
            id="firstLetter"
            name="searchByType"
            onChange={ handleChange }
          />
          <label htmlFor="firstLetter">First Letter</label>
        </div>
        <section className="searchBtn">
          <button
            type="button"
            data-testid="exec-search-btn"
            onClick={ () => getRecipes() }
          >
            SEARCH
          </button>
        </section>
      </section>

    </form>
  );
}

export default SearchBar;
