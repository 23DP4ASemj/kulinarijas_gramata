// lapas/Profils.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCurrentUser, getUserById, updateUserProfile } from '../util/auth';
import { getRecipesByUser, getCollectionsByUser } from '../util/kolekcijas';
import '../stili/profils.css';

const Profils = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userRecipes, setUserRecipes] = useState([]);
  const [userCollections, setUserCollections] = useState([]);
  const [activeTab, setActiveTab] = useState('receptes');

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    let userData;
    if (userId) {
      userData = getUserById(userId);
    } else {
      userData = getCurrentUser();
    }
    
    if (userData) {
      setUser(userData);
      const recipes = getRecipesByUser(userData.id);
      const collections = getCollectionsByUser(userData.id);
      setUserRecipes(recipes);
      setUserCollections(collections);
    }
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      await updateUserProfile(updatedData);
      setUser(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Kļūda saglabājot profilu:', error);
    }
  };

  if (!user) {
    return (
      <div className="profils-loading">
        <div className="loading-spinner"></div>
        <p>Ielādē profilu...</p>
      </div>
    );
  }

  const isOwnProfile = !userId || userId === user.id;

  return (
    <div className="profils-lapa">
      <div className="profils-header">
        <div className="profils-info">
          <div className="profils-avatar-section">
            <img 
              src={user.avatar || '/default-avatar.png'} 
              alt={user.name}
              className="profils-avatar"
            />
            {isOwnProfile && (
              <button className="edit-avatar-btn">
                📷 Mainīt
              </button>
            )}
          </div>
          
          <div className="profils-details">
            <h1 className="profils-name">{user.name}</h1>
            <p className="profils-bio">{user.bio || 'Nav pievienota biogrāfija'}</p>
            <div className="profils-stats">
              <div className="stat">
                <strong>{userRecipes.length}</strong>
                <span>Receptes</span>
              </div>
              <div className="stat">
                <strong>{userCollections.length}</strong>
                <span>Kolekcijas</span>
              </div>
              <div className="stat">
                <strong>{user.joinedDate || '2024'}</strong>
                <span>Pievienojies</span>
              </div>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <button 
            className="edit-profils-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Atcelt' : 'Rediģēt profilu'}
          </button>
        )}
      </div>

      {isEditing && isOwnProfile && (
        <ProfileEditForm 
          user={user} 
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      )}

      <div className="profils-content">
        <div className="profils-tabs">
          <button 
            className={`tab ${activeTab === 'receptes' ? 'active' : ''}`}
            onClick={() => setActiveTab('receptes')}
          >
            Manas receptes ({userRecipes.length})
          </button>
          <button 
            className={`tab ${activeTab === 'kolekcijas' ? 'active' : ''}`}
            onClick={() => setActiveTab('kolekcijas')}
          >
            Kolekcijas ({userCollections.length})
          </button>
        </div>

        <div className="profils-tab-content">
          {activeTab === 'receptes' && (
            <div className="recipes-grid">
              {userRecipes.length > 0 ? (
                userRecipes.map(recipe => (
                  <Link 
                    key={recipe.id} 
                    to={`/recepte/${recipe.id}`}
                    className="recipe-card-link"
                  >
                    <div className="recipe-card">
                      <img 
                        src={recipe.attels || '/placeholder-food.jpg'} 
                        alt={recipe.nosaukums}
                        className="recipe-image"
                      />
                      <div className="recipe-info">
                        <h3>{recipe.nosaukums}</h3>
                        <p className="recipe-time">⏱️ {recipe.laiks} min</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-state">
                  <p>Vēl nav izveidotas receptes</p>
                  {isOwnProfile && (
                    <Link to="/pievienot" className="btn-primary">
                      Pievienot pirmo recepti
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'kolekcijas' && (
            <div className="collections-grid">
              {userCollections.length > 0 ? (
                userCollections.map(collection => (
                  <KolekcijasKarte 
                    key={collection.id} 
                    kolekcija={collection}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <p>Vēl nav izveidotas kolekcijas</p>
                  {isOwnProfile && (
                    <button className="btn-primary">
                      Izveidot pirmo kolekciju
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileEditForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || '',
    avatar: user.avatar || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
  };

  return (
    <form className="profile-edit-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Vārds:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Biogrāfija:</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          rows="4"
          placeholder="Pastāsti par sevi..."
        />
      </div>

      <div className="form-group">
        <label>Avatara URL:</label>
        <input
          type="url"
          value={formData.avatar}
          onChange={(e) => setFormData({...formData, avatar: e.target.value})}
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">Saglabāt</button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Atcelt
        </button>
      </div>
    </form>
  );
};

export default Profils;
