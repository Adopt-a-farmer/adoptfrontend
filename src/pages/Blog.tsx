import React, { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, BookOpen, TrendingUp, Lightbulb, Sprout } from 'lucide-react';
import { knowledgeService, type KnowledgeArticle } from '@/services/knowledge';
import { toast } from 'sonner';

const Blog = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Articles', icon: BookOpen },
    { id: 'Crop Management', name: 'Crop Management', icon: Sprout },
    { id: 'Irrigation', name: 'Irrigation', icon: TrendingUp },
    { id: 'Pest Control', name: 'Pest Control', icon: Lightbulb },
    { id: 'Soil Health', name: 'Soil Health', icon: Sprout },
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await knowledgeService.getArticles({
          limit: 12,
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        });
        
        if (response.success && response.data) {
          const articlesList = Array.isArray(response.data) 
            ? response.data 
            : response.data.articles || [];
          setArticles(articlesList);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        toast.error('Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'guide': return 'bg-green-100 text-green-800';
      case 'research': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero */}
      <section className="bg-gradient-to-r from-fresh-green to-farmer-primary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Agricultural Insights</h1>
            <p className="text-xl text-white/90">
              Expert tips, guides, and stories from the farming community
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                className={selectedCategory === cat.id ? 'bg-fresh-green' : ''}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <cat.icon className="h-4 w-4 mr-2" />
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article._id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-fresh-green/20 to-farmer-primary/20 flex items-center justify-center">
                    <BookOpen className="h-20 w-20 text-fresh-green" />
                  </div>
                  <CardHeader className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        Article
                      </Badge>
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                      {article.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {article.excerpt || article.content.substring(0, 150) + '...'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(article.createdAt)}</span>
                      </div>
                      {article.author && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{article.author.firstName} {article.author.lastName}</span>
                        </div>
                      )}
                    </div>

                    <Link to={`/knowledge?article=${article._id}`}>
                      <Button className="w-full bg-fresh-green hover:bg-farmer-secondary">
                        Read Article
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto text-center">
              <BookOpen className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {selectedCategory !== 'all' ? 'No Articles in This Category Yet' : 'Building Our Content Library'}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {selectedCategory !== 'all' 
                  ? 'Check back soon for valuable content in this category, or explore other categories.'
                  : "We're preparing valuable content about agriculture, farming tips, and industry insights. Stay tuned!"
                }
              </p>
              <Link to="/knowledge">
                <Button className="bg-fresh-green hover:bg-farmer-secondary">
                  Visit Knowledge Hub
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-fresh-green to-farmer-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Stay Updated
            </h2>
            <p className="text-xl mb-8">
              Get the latest farming tips, guides, and success stories delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900"
              />
              <Button size="lg" variant="secondary" className="bg-white text-fresh-green hover:bg-gray-100">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Join Our Community
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with farmers and experts, share knowledge, and grow together
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-fresh-green hover:bg-farmer-secondary">
                Create Account
              </Button>
            </Link>
            <Link to="/knowledge">
              <Button size="lg" variant="outline">
                Explore Knowledge Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
