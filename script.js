document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const recipeList = document.getElementById('recipe-list');
    const noRecipesMessage = document.getElementById('no-recipes-message');
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');
    const favoritesFilterBtn = document.getElementById('favorites-filter');
    const addRecipeBtn = document.getElementById('add-recipe-btn');
    const recipeModal = document.getElementById('recipe-modal');
    const detailModal = document.getElementById('detail-modal');
    const shoppingListModal = document.getElementById('shopping-list-modal');
    const recipeForm = document.getElementById('recipe-form');
    const modalTitle = document.getElementById('modal-title');
    const recipeIdInput = document.getElementById('recipe-id');
    const recipeNameInput = document.getElementById('recipe-name');
    const recipeCategoryInput = document.getElementById('recipe-category');
    const recipeTimeInput = document.getElementById('recipe-time');
    const recipeServingsInput = document.getElementById('recipe-servings');
    const recipeInstructionsInput = document.getElementById('recipe-instructions');
    const recipeImageInput = document.getElementById('recipe-image');
    const ingredientsContainer = document.getElementById('ingredients-container');
    const addIngredientBtn = document.getElementById('add-ingredient');
    const cancelBtn = document.getElementById('cancel-btn');
    const recipeDetailContainer = document.getElementById('recipe-detail-container');
    const editRecipeBtn = document.getElementById('edit-recipe-btn');
    const deleteRecipeBtn = document.getElementById('delete-recipe-btn');
    const addToShoppingBtn = document.getElementById('add-to-shopping-btn');
    const viewShoppingListBtn = document.getElementById('view-shopping-list-btn');
    const shoppingListContainer = document.getElementById('shopping-list-container');
    const printShoppingListBtn = document.getElementById('print-shopping-list');
    const clearShoppingListBtn = document.getElementById('clear-shopping-list');
    const closeBtns = document.querySelectorAll('.close');
    
    // State Management
    let recipes = [];
    let currentRecipeId = null;
    let shoppingList = [];
    let isFavoritesFilterActive = false;
    
    // Initialize the application
    function init() {
        loadRecipes();
        loadShoppingList();
        renderRecipes();
        setupEventListeners();
    }
    
    // Local Storage Functions
    function loadRecipes() {
        const storedRecipes = localStorage.getItem('recipes');
        if (storedRecipes) {
            try {
                recipes = JSON.parse(storedRecipes);
            } catch (error) {
                console.error('Error parsing recipes from localStorage:', error);
                recipes = [];
                saveRecipes();
            }
        }
    }
    
    function saveRecipes() {
        try {
            localStorage.setItem('recipes', JSON.stringify(recipes));
        } catch (error) {
            console.error('Error saving recipes to localStorage:', error);
            alert('Error saving recipes. Local storage may be full or disabled.');
        }
    }
    
    function loadShoppingList() {
        const storedShoppingList = localStorage.getItem('shoppingList');
        if (storedShoppingList) {
            try {
                shoppingList = JSON.parse(storedShoppingList);
            } catch (error) {
                console.error('Error parsing shopping list from localStorage:', error);
                shoppingList = [];
                saveShoppingList();
            }
        }
    }
    
    function saveShoppingList() {
        try {
            localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        } catch (error) {
            console.error('Error saving shopping list to localStorage:', error);
            alert('Error saving shopping list. Local storage may be full or disabled.');
        }
    }
    
    // Event Listeners
    function setupEventListeners() {
        // Search and filter
        searchInput.addEventListener('input', debounce(renderRecipes, 300));
        filterSelect.addEventListener('change', renderRecipes);
        favoritesFilterBtn.addEventListener('click', toggleFavoritesFilter);
        
        // Recipe form events
        addRecipeBtn.addEventListener('click', openAddRecipeModal);
        addIngredientBtn.addEventListener('click', addIngredientRow);
        recipeForm.addEventListener('submit', saveRecipe);
        cancelBtn.addEventListener('click', closeModal);
        
        // Recipe detail events
        editRecipeBtn.addEventListener('click', handleEditRecipe);
        deleteRecipeBtn.addEventListener('click', handleDeleteRecipe);
        addToShoppingBtn.addEventListener('click', addRecipeToShoppingList);
        
        // Shopping list events
        viewShoppingListBtn.addEventListener('click', openShoppingListModal);
        printShoppingListBtn.addEventListener('click', printShoppingList);
        clearShoppingListBtn.addEventListener('click', clearShoppingList);
        
        // Close modals
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                closeAllModals();
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === recipeModal) {
                closeModal();
            } else if (e.target === detailModal) {
                closeDetailModal();
            } else if (e.target === shoppingListModal) {
                closeShoppingListModal();
            }
        });
    }
    
    // Recipe Rendering Functions
    function renderRecipes() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterCategory = filterSelect.value;
        
        // Clear the list except for the no recipes message
        const cards = recipeList.querySelectorAll('.recipe-card');
        cards.forEach(card => card.remove());
        
        // Filter recipes
        let filteredRecipes = recipes;
        
        if (searchTerm) {
            filteredRecipes = filteredRecipes.filter(recipe => {
                const nameMatch = recipe.name.toLowerCase().includes(searchTerm);
                const ingredientMatch = recipe.ingredients.some(ing => 
                    ing.toLowerCase().includes(searchTerm)
                );
                return nameMatch || ingredientMatch;
            });
        }
        
        if (filterCategory !== 'all') {
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.category === filterCategory
            );
        }
        
        if (isFavoritesFilterActive) {
            filteredRecipes = filteredRecipes.filter(recipe => recipe.isFavorite);
        }
        
        // Show or hide the "no recipes" message
        if (filteredRecipes.length === 0 && recipes.length === 0) {
            noRecipesMessage.style.display = 'block';
            noRecipesMessage.innerHTML = '<p>You don\'t have any recipes yet. Click "Add New Recipe" to create your first recipe!</p>';
        } else if (filteredRecipes.length === 0) {
            noRecipesMessage.style.display = 'block';
            noRecipesMessage.innerHTML = '<p>No recipes match your search criteria.</p>';
        } else {
            noRecipesMessage.style.display = 'none';
        }
        
        // Render the filtered recipes
        filteredRecipes.forEach(recipe => {
            const recipeCard = createRecipeCard(recipe);
            recipeList.appendChild(recipeCard);
        });
    }
    
    function createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        const imageUrl = recipe.imageUrl || 'https://via.placeholder.com/300x180?text=No+Image';
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${recipe.name}" class="recipe-image" onerror="this.src='https://via.placeholder.com/300x180?text=Error+Loading+Image'">
            <div class="recipe-info">
                <div class="recipe-title">
                    <h3>${recipe.name}</h3>
                    <button class="favorite-btn ${recipe.isFavorite ? 'active' : ''}">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.time} mins</span>
                    <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
                </div>
                <span class="recipe-category">${capitalizeFirstLetter(recipe.category)}</span>
                <button class="view-recipe-btn">View Recipe</button>
            </div>
        `;
        
        // Add event listeners to the card
        card.querySelector('.view-recipe-btn').addEventListener('click', () => {
            openRecipeDetail(recipe.id);
        });
        
        // Toggle favorite
        card.querySelector('.favorite-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(recipe.id);
        });
        
        return card;
    }
    
    // Recipe Form Functions
    function openAddRecipeModal() {
        modalTitle.textContent = 'Add New Recipe';
        recipeForm.reset();
        recipeIdInput.value = '';
        currentRecipeId = null;
        
        // Clear existing ingredient rows and add a fresh one
        ingredientsContainer.innerHTML = '';
        addIngredientRow();
        
        // Open the modal
        recipeModal.style.display = 'block';
    }
    
    function openEditRecipeModal(recipe) {
        modalTitle.textContent = 'Edit Recipe';
        recipeIdInput.value = recipe.id;
        currentRecipeId = recipe.id;
        recipeNameInput.value = recipe.name;
        recipeCategoryInput.value = recipe.category;
        recipeTimeInput.value = recipe.time;
        recipeServingsInput.value = recipe.servings;
        recipeInstructionsInput.value = recipe.instructions;
        recipeImageInput.value = recipe.imageUrl || '';
        
        // Clear existing ingredient rows
        ingredientsContainer.innerHTML = '';
        
        // Add ingredient rows for each ingredient
        recipe.ingredients.forEach(ingredient => {
            addIngredientRow(ingredient);
        });
        
        // Add an empty row if there are no ingredients
        if (recipe.ingredients.length === 0) {
            addIngredientRow();
        }
        
        // Open the modal
        closeDetailModal();
        recipeModal.style.display = 'block';
    }
    
    function addIngredientRow(value = '') {
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `
            <input type="text" class="ingredient-input" placeholder="e.g., 2 cups flour" value="${value}" required>
            <button type="button" class="remove-ingredient"><i class="fas fa-times"></i></button>
        `;
        
        row.querySelector('.remove-ingredient').addEventListener('click', () => {
            // Only remove if there's more than one ingredient row
            if (ingredientsContainer.children.length > 1) {
                row.remove();
            }
        });
        
        ingredientsContainer.appendChild(row);
        row.querySelector('.ingredient-input').focus();
    }
    
    function saveRecipe(e) {
        e.preventDefault();
        
        // Get all ingredient inputs
        const ingredientInputs = ingredientsContainer.querySelectorAll('.ingredient-input');
        const ingredients = [];
        
        // Collect ingredients
        ingredientInputs.forEach(input => {
            if (input.value.trim()) {
                ingredients.push(input.value.trim());
            }
        });
        
        // Create recipe object
        const recipe = {
            id: recipeIdInput.value || generateId(),
            name: recipeNameInput.value,
            category: recipeCategoryInput.value,
            time: parseInt(recipeTimeInput.value),
            servings: parseInt(recipeServingsInput.value),
            ingredients: ingredients,
            instructions: recipeInstructionsInput.value,
            imageUrl: recipeImageInput.value,
            isFavorite: false,
            dateCreated: new Date().toISOString()
        };
        
        // Check if editing or adding
        if (currentRecipeId) {
            // Find and update the existing recipe
            const index = recipes.findIndex(r => r.id === currentRecipeId);
            if (index !== -1) {
                // Preserve the favorite status
                recipe.isFavorite = recipes[index].isFavorite;
                recipes[index] = recipe;
            }
        } else {
            // Add new recipe
            recipes.push(recipe);
        }
        
        // Save to local storage and update the UI
        saveRecipes();
        renderRecipes();
        closeModal();
    }
    
    function closeModal() {
        recipeModal.style.display = 'none';
    }
    
    // Recipe Detail Functions
    function openRecipeDetail(recipeId) {
        currentRecipeId = recipeId;
        const recipe = recipes.find(r => r.id === recipeId);
        
        if (!recipe) {
            console.error('Recipe not found:', recipeId);
            return;
        }
        
        // Create the recipe detail HTML
        recipeDetailContainer.innerHTML = `
            <div class="recipe-detail-header">
                <div class="recipe-detail-title">
                    <h2>${recipe.name}</h2>
                    <button class="favorite-btn ${recipe.isFavorite ? 'active' : ''}">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
                <span class="recipe-category">${capitalizeFirstLetter(recipe.category)}</span>
            </div>
            
            ${recipe.imageUrl ? `<img src="${recipe.imageUrl}" alt="${recipe.name}" class="recipe-detail-image" onerror="this.src='https://via.placeholder.com/800x400?text=Error+Loading+Image'">` : ''}
            
            <div class="recipe-detail-meta">
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${recipe.time} minutes</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-utensils"></i>
                    <span>${recipe.servings} servings</span>
                </div>
            </div>
            
            <h3>Ingredients</h3>
            <ul class="ingredient-list">
                ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
            
            <h3>Instructions</h3>
            <div class="instruction-list">
                ${formatInstructions(recipe.instructions)}
            </div>
        `;
        
        // Add event listener to the favorite button
        recipeDetailContainer.querySelector('.favorite-btn').addEventListener('click', () => {
            toggleFavorite(recipeId);
            // Update the active class on the button
            recipeDetailContainer.querySelector('.favorite-btn').classList.toggle('active', recipe.isFavorite);
        });
        
        // Open the modal
        detailModal.style.display = 'block';
    }
    
    function closeDetailModal() {
        detailModal.style.display = 'none';
    }
    
    function handleEditRecipe() {
        const recipe = recipes.find(r => r.id === currentRecipeId);
        if (recipe) {
            openEditRecipeModal(recipe);
        }
    }
    
    function handleDeleteRecipe() {
        if (confirm('Are you sure you want to delete this recipe?')) {
            // Remove the recipe from the array
            recipes = recipes.filter(r => r.id !== currentRecipeId);
            
            // Save to local storage and update the UI
            saveRecipes();
            renderRecipes();
            closeDetailModal();
        }
    }
    
    function toggleFavorite(recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
            recipe.isFavorite = !recipe.isFavorite;
            saveRecipes();
            renderRecipes();
        }
    }
    
    function toggleFavoritesFilter() {
        isFavoritesFilterActive = !isFavoritesFilterActive;
        favoritesFilterBtn.classList.toggle('active', isFavoritesFilterActive);
        renderRecipes();
    }
    
    // Shopping List Functions
    function addRecipeToShoppingList() {
        const recipe = recipes.find(r => r.id === currentRecipeId);
        if (!recipe) return;
        
        // Add each ingredient to shopping list if not already there
        recipe.ingredients.forEach(ingredient => {
            const existingIndex = shoppingList.findIndex(item => 
                item.text.toLowerCase() === ingredient.toLowerCase()
            );
            
            if (existingIndex === -1) {
                shoppingList.push({
                    id: generateId(),
                    text: ingredient,
                    isChecked: false,
                    recipeId: recipe.id,
                    recipeName: recipe.name
                });
            }
        });
        
        saveShoppingList();
        alert(`Ingredients from "${recipe.name}" added to shopping list!`);
    }
    
    function openShoppingListModal() {
        renderShoppingList();
        shoppingListModal.style.display = 'block';
    }
    
    function closeShoppingListModal() {
        shoppingListModal.style.display = 'none';
    }
    
    function renderShoppingList() {
        shoppingListContainer.innerHTML = '';
        
        if (shoppingList.length === 0) {
            shoppingListContainer.innerHTML = '<p>Your shopping list is empty.</p>';
            return;
        }
        
        // Group items by recipe
        const groupedItems = {};
        
        shoppingList.forEach(item => {
            const key = item.recipeId || 'misc';
            if (!groupedItems[key]) {
                groupedItems[key] = {
                    name: item.recipeName || 'Miscellaneous',
                    items: []
                };
            }
            groupedItems[key].items.push(item);
        });
        
        // Create the shopping list HTML
        Object.keys(groupedItems).forEach(key => {
            const group = groupedItems[key];
            
            const groupElement = document.createElement('div');
            groupElement.className = 'shopping-group';
            groupElement.innerHTML = `<h3>${group.name}</h3>`;
            
            group.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'shopping-item';
                itemElement.innerHTML = `
                    <input type="checkbox" class="shopping-checkbox" id="item-${item.id}" ${item.isChecked ? 'checked' : ''}>
                    <label for="item-${item.id}" class="shopping-text ${item.isChecked ? 'checked' : ''}">${item.text}</label>
                    <button class="remove-item"><i class="fas fa-times"></i></button>
                `;
                
                // Checkbox change event
                itemElement.querySelector('.shopping-checkbox').addEventListener('change', (e) => {
                    toggleShoppingItem(item.id, e.target.checked);
                });
                
                // Remove button click event
                itemElement.querySelector('.remove-item').addEventListener('click', () => {
                    removeShoppingItem(item.id);
                });
                
                groupElement.appendChild(itemElement);
            });
            
            shoppingListContainer.appendChild(groupElement);
        });
    }
    
    function toggleShoppingItem(itemId, isChecked) {
        const item = shoppingList.find(i => i.id === itemId);
        if (item) {
            item.isChecked = isChecked;
            saveShoppingList();
            renderShoppingList();
        }
    }
    
    function removeShoppingItem(itemId) {
        shoppingList = shoppingList.filter(i => i.id !== itemId);
        saveShoppingList();
        renderShoppingList();
    }
    
    function clearShoppingList() {
        if (confirm('Are you sure you want to clear the entire shopping list?')) {
            shoppingList = [];
            saveShoppingList();
            renderShoppingList();
        }
    }
    
    function printShoppingList() {
        const printWindow = window.open('', '_blank');
        
        // Create the print content
        let content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Shopping List</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                    h1 { text-align: center; margin-bottom: 20px; }
                    .group { margin-bottom: 20px; }
                    h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                    ul { list-style-type: square; }
                    li { margin-bottom: 10px; }
                    .checked { text-decoration: line-through; color: #999; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Shopping List</h1>
                <button onclick="window.print()">Print</button>
        `;
        
        // Group items by recipe
        const groupedItems = {};
        
        shoppingList.forEach(item => {
            const key = item.recipeId || 'misc';
            if (!groupedItems[key]) {
                groupedItems[key] = {
                    name: item.recipeName || 'Miscellaneous',
                    items: []
                };
            }
            groupedItems[key].items.push(item);
        });
        
        // Add items to content
        Object.keys(groupedItems).forEach(key => {
            const group = groupedItems[key];
            
            content += `
                <div class="group">
                    <h2>${group.name}</h2>
                    <ul>
            `;
            
            group.items.forEach(item => {
                content += `<li class="${item.isChecked ? 'checked' : ''}">${item.text}</li>`;
            });
            
            content += `
                    </ul>
                </div>
            `;
        });
        
        content += `
            </body>
            </html>
        `;
        
        printWindow.document.open();
        printWindow.document.write(content);
        printWindow.document.close();
    }
    
    // Utility Functions
    function closeAllModals() {
        recipeModal.style.display = 'none';
        detailModal.style.display = 'none';
        shoppingListModal.style.display = 'none';
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    function formatInstructions(instructions) {
        if (!instructions) return '';
        
        // Split by newlines and wrap in paragraphs
        return instructions
            .split('\n')
            .filter(line => line.trim())
            .map(line => `<p>${line}</p>`)
            .join('');
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // Initialize the application
    init();
});