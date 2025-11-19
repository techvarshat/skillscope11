export interface Resource {
  id: string;
  title: string;
  provider: 'YouTube' | 'Udemy' | 'Coursera' | 'freeCodeCamp';
  url: string;
  rating: number;
  views: number;
  category: 'Web Development' | 'UI/UX Design' | 'Data Science' | 'General' | 'Learning';
  thumbnail: string;
  summary: string;
  createdAt: string;
}

export const dummyData: Resource[] = [
  {
    id: '1',
    title: 'Full Modern React Tutorial',
    provider: 'YouTube',
    url: '#',
    rating: 4.9,
    views: 2100000,
    category: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    summary: 'This resource is highly recommended for its comprehensive coverage of React hooks and modern state management, making it perfect for both beginners and those looking to update their skills.',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Figma for Beginners: UI/UX Design',
    provider: 'Udemy',
    url: '#',
    rating: 4.8,
    views: 890000,
    category: 'UI/UX Design',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    summary: 'A great starting point for aspiring designers. It provides a solid foundation in Figma\'s tools and UI/UX principles through practical, easy-to-follow examples.',
    createdAt: '2023-01-02T00:00:00Z'
  },
  {
    id: '3',
    title: 'Python for Data Science - Full Course',
    provider: 'freeCodeCamp',
    url: '#',
    rating: 4.9,
    views: 3500000,
    category: 'Data Science',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    summary: 'An extensive, in-depth course that covers all essential Python libraries for data science. Its project-based approach ensures you gain hands-on experience.',
    createdAt: '2023-01-03T00:00:00Z'
  },
  {
    id: '4',
    title: 'JavaScript Crash Course for Beginners',
    provider: 'YouTube',
    url: '#',
    rating: 4.7,
    views: 5200000,
    category: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    summary: 'This fast-paced course is excellent for quickly grasping the fundamentals of JavaScript. It is well-structured and covers core concepts effectively.',
    createdAt: '2023-01-04T00:00:00Z'
  },
  {
    id: '5',
    title: 'Intro to UI/UX: Principles of User Experience',
    provider: 'Coursera',
    url: '#',
    rating: 4.8,
    views: 450000,
    category: 'UI/UX Design',
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    summary: 'Offered by a leading university, this course provides a theoretical and research-backed understanding of UX principles, essential for a strong design career.',
    createdAt: '2023-01-05T00:00:00Z'
  },
    {
    id: '6',
    title: 'Data Analysis with Pandas',
    provider: 'Udemy',
    url: '#',
    rating: 4.7,
    views: 1100000,
    category: 'Data Science',
    thumbnail: 'https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    summary: 'A practical, hands-on guide to one of the most important data analysis libraries in Python. Great for learners who want to work with real-world datasets.',
    createdAt: '2023-01-06T00:00:00Z'
  },
  {
    id: '7',
    title: 'HTML & CSS Full Course for Beginners',
    provider: 'freeCodeCamp',
    url: '#',
    rating: 4.8,
    views: 7800000,
    category: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    summary: 'The definitive starting point for any web developer. This exhaustive course covers everything from the basics to advanced concepts like Flexbox and Grid.',
    createdAt: '2023-01-07T00:00:00Z'
  },
  {
    id: '8',
    title: 'Advanced Figma: Prototyping and Animations',
    provider: 'YouTube',
    url: '#',
    rating: 4.9,
    views: 760000,
    category: 'UI/UX Design',
    thumbnail: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    summary: 'Takes your Figma skills to the next level. This tutorial is praised for its clear explanations of complex features like Smart Animate and interactive components.',
    createdAt: '2023-01-08T00:00:00Z'
  }
];

// --- SIMULATED BACKEND API ---

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Searches for resources based on a query.
 * @param query The search term.
 * @returns A promise that resolves to an array of resources.
 */
export const searchResources = async (query: string): Promise<Resource[]> => {
  await sleep(500); // Simulate API latency
  if (!query) {
    return [];
  }
  try {
    const response = await fetch(`http://localhost:4000/api/search?q=${encodeURIComponent(query)}&max=50`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch from backend, falling back to dummy data:', error);
    const lowerCaseQuery = query.toLowerCase();
    return dummyData.filter(item =>
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      item.category.toLowerCase().includes(lowerCaseQuery)
    );
  }
};

/**
 * Fetches all available resources.
 * @returns A promise that resolves to an array of all resources.
 */
export const getResources = async (): Promise<Resource[]> => {
    await sleep(500); // Simulate API latency
    return dummyData;
};
