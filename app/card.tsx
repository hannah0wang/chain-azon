interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg border border-gray-700 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
}

// Usage example (you can delete this comment and example):
/*
<Card title="Example Card">
  <div className="text-gray-300">
    <p>This is some content inside the card.</p>
    <p className="mt-2">You can put any content here.</p>
  </div>
</Card>

// Or without a title:
<Card>
  <div className="text-gray-300">
    <p>A card without a title.</p>
  </div>
</Card>
*/
