document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const recipeList = document.getElementById('recipe-list');
    const noRecipesMessage = document.getElementById('no-recipes-message');
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');
    const favoritesFilterBtn = document.getElementById('favorites-filter');
    const addRecipeBtn = document.getElementById('add-recipe-btn');
    const emptyAddBtn = document.getElementById('empty-add-btn');
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
    const shoppingListFab = document.getElementById('shopping-list-fab');
    const shoppingListContainer = document.getElementById('shopping-list-container');
    const printShoppingListBtn = document.getElementById('print-shopping-list');
    const clearShoppingListBtn = document.getElementById('clear-shopping-list');
    const closeBtns = document.querySelectorAll('.close-btn');
    
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
            showToast('Error saving recipes. Storage may be full.', 'error');
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
            showToast('Error saving shopping list. Storage may be full.', 'error');
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
        emptyAddBtn.addEventListener('click', openAddRecipeModal);
        addIngredientBtn.addEventListener('click', addIngredientRow);
        recipeForm.addEventListener('submit', saveRecipe);
        cancelBtn.addEventListener('click', closeModal);
        
        // Recipe detail events
        editRecipeBtn.addEventListener('click', handleEditRecipe);
        deleteRecipeBtn.addEventListener('click', handleDeleteRecipe);
        addToShoppingBtn.addEventListener('click', addRecipeToShoppingList);
        
        // Shopping list events
        shoppingListFab.addEventListener('click', openShoppingListModal);
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

        // Enable ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
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
        } else if (filteredRecipes.length === 0) {
            noRecipesMessage.style.display = 'block';
            noRecipesMessage.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search empty-icon"></i>
                    <h2>No matching recipes</h2>
                    <p>Try adjusting your search criteria or filters.</p>
                </div>
            `;
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
        
        const imageUrl = recipe.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image';
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${recipe.name}" class="recipe-image" onerror="this.src='https://via.placeholder.com/400x300?text=Error+Loading+Image'">
            <div class="recipe-content">
                <div class="recipe-header">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <button class="favorite-btn ${recipe.isFavorite ? 'active' : ''}">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
                <div class="recipe-meta">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${recipe.time} mins</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-utensils"></i>
                        <span>${recipe.servings} servings</span>
                    </div>
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
        recipeNameInput.focus();
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
        recipeNameInput.focus();
    }
    
    function addIngredientRow(value = '') {
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `
            <input type="text" class="ingredient-input" placeholder="e.g., 2 cups flour" value="${value}" required>
            <button type="button" class="remove-ingredient"><i class="fas fa-trash"></i></button>
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
                showToast('Recipe updated successfully!', 'success');
            }
        } else {
            // Add new recipe
            recipes.push(recipe);
            showToast('Recipe added successfully!', 'success');
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
            showToast('Recipe not found.', 'error');
            return;
        }
        
        // Format instructions with step numbers
        const instructionsHtml = recipe.instructions
            .split('\n')
            .filter(step => step.trim())
            .map((step, index) => `
                <div class="instruction-step">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-text">${step}</div>
                </div>
            `)
            .join('');
        
        // Create the recipe detail HTML
        recipeDetailContainer.innerHTML = `
            <div class="recipe-detail">
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
                        <span>Time: ${recipe.time} minutes</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-utensils"></i>
                        <span>Servings: ${recipe.servings}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Added: ${formatDate(recipe.dateCreated)}</span>
                    </div>
                </div>
                
                <div class="ingredients-section">
                    <h3 class="section-title">Ingredients</h3>
                    <ul class="ingredient-list">
                        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="instructions-section">
                    <h3 class="section-title">Instructions</h3>
                    <div class="instruction-list">
                        ${instructionsHtml}
                    </div>
                </div>
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
        const recipe = recipes.find(r => r.id === currentRecipeId);
        
        if (confirmAction(`Are you sure you want to delete "${recipe.name}"?`)) {
            // Remove the recipe from the array
            recipes = recipes.filter(r => r.id !== currentRecipeId);
            
            // Save to local storage and update the UI
            saveRecipes();
            renderRecipes();
            closeDetailModal();
            showToast('Recipe deleted successfully!', 'success');
        }
    }
    
    function toggleFavorite(recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
            recipe.isFavorite = !recipe.isFavorite;
            saveRecipes();
            renderRecipes();
            
            if (recipe.isFavorite) {
                showToast(`"${recipe.name}" added to favorites!`, 'success');
            }
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
        let addedCount = 0;
        
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
                addedCount++;
            }
        });
        
        saveShoppingList();
        closeDetailModal();
        
        if (addedCount > 0) {
            showToast(`${addedCount} ingredients from "${recipe.name}" added to shopping list!`, 'success');
        } else {
            showToast('All ingredients are already in your shopping list.', 'info');
        }
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
            shoppingListContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-basket empty-icon"></i>
                    <h2>Your shopping list is empty</h2>
                    <p>Add ingredients from recipes to your shopping list.</p>
                </div>
            `;
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
            
            groupElement.innerHTML = `
                <h3 class="group-title">
                    <i class="fas fa-clipboard-list"></i>
                    ${group.name}
                </h3>
            `;
            
            group.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'shopping-item';
                itemElement.innerHTML = `
                    <input type="checkbox" class="shopping-checkbox" id="item-${item.id}" ${item.isChecked ? 'checked' : ''}>
                    <label for="item-${item.id}" class="shopping-text ${item.isChecked ? 'checked' : ''}">${item.text}</label>
                    <button class="icon-btn remove-item"><i class="fas fa-times"></i></button>
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
            
            // Only update the specific item, not the entire list
            const checkbox = document.getElementById(`item-${itemId}`);
            const label = checkbox.nextElementSibling;
            if (isChecked) {
                label.classList.add('checked');
            } else {
                label.classList.remove('checked');
            }
        }
    }
    
    function removeShoppingItem(itemId) {
        shoppingList = shoppingList.filter(i => i.id !== itemId);
        saveShoppingList();
        renderShoppingList();
        showToast('Item removed from shopping list.', 'info');
    }
    
    function clearShoppingList() {
        if (confirmAction('Are you sure you want to clear the entire shopping list?')) {
            shoppingList = [];
            saveShoppingList();
            renderShoppingList();
            showToast('Shopping list cleared.', 'info');
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
                    body { 
                        font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
                        line-height: 1.6; 
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    h1 { 
                        text-align: center; 
                        margin-bottom: 20px;
                        color: #4caf50;
                    }
                    .print-date {
                        text-align: center;
                        font-size: 0.9rem;
                        color: #757575;
                        margin-bottom: 30px;
                    }
                    .group { 
                        margin-bottom: 20px; 
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    h2 { 
                        background-color: #f5f5f5;
                        padding: 10px 15px;
                        margin: 0;
                        font-size: 1.2rem;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    ul { 
                        list-style-type: square;
                        padding: 15px 40px;
                        margin: 0;
                    }
                    li { 
                        margin-bottom: 8px;
                        padding: 5px 0;
                    }
                    .checked { 
                        text-decoration: line-through; 
                        color: #9e9e9e; 
                    }
                    .print-button {
                        display: block;
                        width: 150px;
                        margin: 20px auto;
                        padding: 10px;
                        background-color: #4caf50;
                        color: white;
                        text-align: center;
                        border-radius: 4px;
                        cursor: pointer;
                        border: none;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        font-size: 0.9rem;
                        color: #757575;
                        border-top: 1px solid #e0e0e0;
                        padding-top: 20px;
                    }
                    @media print {
                        .print-button { display: none; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <h1>Shopping List</h1>
                <div class="print-date">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
                <button class="print-button" onclick="window.print()">Print List</button>
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
                <div class="footer">Recipe Manager - Your Personal Recipe Collection</div>
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
    
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        }).format(date);
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
    
    function confirmAction(message) {
        return window.confirm(message);
    }
    
    function showToast(message, type = 'info') {
        // Remove any existing toasts
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Add icon based on type
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        // Add to DOM
        document.body.appendChild(toast);
        
        // Remove after animation completes
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // Sample Recipes (for first-time users)
    function addSampleRecipes() {
        if (recipes.length === 0) {
            const sampleRecipes = [
                {
                    id: generateId(),
                    name: "Veggie Breakfast Scramble",
                    category: "breakfast",
                    time: 15,
                    servings: 2,
                    ingredients: [
                        "4 large eggs",
                        "1/2 red bell pepper, diced",
                        "1/2 green bell pepper, diced",
                        "1/4 cup diced onion",
                        "1 cup fresh spinach",
                        "1 tbsp olive oil",
                        "Salt and pepper to taste",
                        "1/4 cup shredded cheddar cheese"
                    ],
                    instructions: "Heat olive oil in a non-stick skillet over medium heat.\nAdd diced onions and bell peppers, sauté for 3-4 minutes until softened.\nAdd spinach and cook until wilted, about 1 minute.\nWhisk eggs in a bowl, season with salt and pepper.\nPour eggs over vegetables and gently stir as they cook.\nWhen eggs are almost set, sprinkle cheese on top and cover until melted.\nServe hot with toast or avocado slices.",
                    imageUrl: "viggie.jpg",
                    isFavorite: false,
                    dateCreated: new Date().toISOString()
                },
                {
                    id: generateId(),
                    name: "Tomato Basil Soup",
                    category: "lunch",
                    time: 25,
                    servings: 2,
                    ingredients: [
                        "2 tbsp olive oil",
                        "1 large onion, chopped",
                        "2 cloves garlic, minced",
                        "2 cans (14 oz each) diced tomatoes",
                        "2 cups vegetable broth",
                        "1/4 cup fresh basil leaves, plus more for garnish",
                        "1 tsp sugar",
                        "1/2 cup heavy cream",
                        "Salt and pepper to taste"
                    ],
                    instructions: "Heat olive oil in a large pot over medium heat.\nAdd onions and cook until translucent, about 5 minutes.\nAdd garlic and cook for another minute.\nAdd diced tomatoes, vegetable broth, basil, and sugar.\nBring to a boil, then reduce heat and simmer for 15 minutes.\nUse an immersion blender to puree the soup until smooth.\nStir in heavy cream and season with salt and pepper.\nServe hot, garnished with fresh basil leaves.",
                    imageUrl: "https://via.placeholder.com/400x300?text=Tomato+Basil+Soup",
                    isFavorite: false,
                    dateCreated: new Date().toISOString()
                },
                {
                    id: generateId(),
                    name: "Peanut Butter Banana Bites",
                    category: "snack",
                    time: 10,
                    servings: 1,
                    ingredients: [
                        "1 ripe banana",
                        "2 tbsp peanut butter",
                        "1/4 cup chocolate chips, melted",
                        "2 tbsp chopped peanuts (optional)"
                    ],
                    instructions: "Slice the banana into 1/2 inch thick rounds.\nSpread a small amount of peanut butter on top of each banana slice.\nStack another banana slice on top to create a sandwich.\nDip each sandwich halfway into melted chocolate.\nSprinkle with chopped peanuts if desired.\nPlace on a parchment-lined tray and freeze for at least 1 hour.\nStore in an airtight container in the freezer.",
                    imageUrl: "https://via.placeholder.com/400x300?text=Peanut+Butter+Banana+Bites",
                    isFavorite: true,
                    dateCreated: new Date().toISOString()
                },
                {
                    id: generateId(),
                    name: "One-Pan Sausage and Veggies",
                    category: "dinner",
                    time: 30,
                    servings: 3,
                    ingredients: [
                        "1 lb smoked sausage, sliced",
                        "2 cups baby red potatoes, quartered",
                        "1 red bell pepper, chopped",
                        "1 zucchini, chopped",
                        "1 yellow squash, chopped",
                        "1/2 red onion, chopped",
                        "2 tbsp olive oil",
                        "2 tsp Italian seasoning",
                        "1 tsp garlic powder",
                        "Salt and pepper to taste",
                        "Fresh parsley for garnish"
                    ],
                    instructions: "Preheat oven to 400°F (200°C).\nIn a large mixing bowl, combine all chopped vegetables and sliced sausage.\nDrizzle with olive oil and add all seasonings.\nToss until everything is evenly coated.\nSpread mixture onto a large baking sheet in a single layer.\nBake for 20-25 minutes, stirring halfway through, until vegetables are tender.\nGarnish with fresh parsley before serving.",
                    imageUrl: "https://via.placeholder.com/400x300?text=One-Pan+Sausage+and+Veggies",
                    isFavorite: false,
                    dateCreated: new Date().toISOString()
                }
            ];
            
            recipes = sampleRecipes;
            saveRecipes();
            renderRecipes();
            showToast('Sample recipes have been added to help you get started!', 'success');
        }
    }
    
    // Check for Dark Mode Preference
    function checkDarkMode() {
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDarkMode) {
            document.body.classList.add('dark-mode-enabled');
        }
        
        // Listen for changes in color scheme preference
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('dark-mode-enabled');
            } else {
                document.body.classList.remove('dark-mode-enabled');
            }
        });
    }
    
    // Initialize the application
    init();
    
    // Add sample recipes if this is a first time user
    addSampleRecipes();
    
    // Check for dark mode preference
    checkDarkMode();
});
