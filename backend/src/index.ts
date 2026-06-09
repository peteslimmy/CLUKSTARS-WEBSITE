import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config/env';
import { errorHandler, notFound } from './middleware/error';
import { cmsInject } from './middleware/cmsInject';
import { csrfProtection, csrfTokenMiddleware } from './middleware/csrf';
import authRoutes from './routes/auth';
import organizationRoutes from './routes/organization';
import brandRoutes from './routes/brand';
import socialRoutes from './routes/social';
import userRoutes from './routes/users';
import roleRoutes from './routes/roles';
import publicRoutes from './routes/public';
import mediaRoutes from './routes/media';
import pageRoutes from './routes/pages';
import postRoutes from './routes/posts';
import navbarRoutes from './routes/navbar';
import footerRoutes from './routes/footer';
import seoRoutes from './routes/seo';
import formRoutes from './routes/forms';
import teamRoutes from './routes/team';
import serviceRoutes from './routes/services';
import caseStudyRoutes from './routes/case-studies';
import homepageStatsRoutes from './routes/homepage-stats';
import aboutValuesRoutes from './routes/about-values';
import aboutStatsRoutes from './routes/about-stats';
import globalBlocksRoutes from './routes/global-blocks';
import sectionRoutes from './routes/sections';
import blockRoutes from './routes/blocks';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:", "fonts.gstatic.com"],
    },
  },
}));
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(csrfTokenMiddleware);
app.use('/api/auth/login', loginLimiter);
app.use('/api/', apiLimiter);
app.use(csrfProtection);

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/social-links', socialRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/navbar', navbarRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/team-members', teamRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/case-studies', caseStudyRoutes);
app.use('/api/homepage-stats', homepageStatsRoutes);
app.use('/api/about-values', aboutValuesRoutes);
app.use('/api/about-stats', aboutStatsRoutes);
app.use('/api/global-blocks', globalBlocksRoutes);
app.use('/api/pages/sections', sectionRoutes);
app.use('/api/pages/blocks', blockRoutes);

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use(cmsInject);
app.use(express.static(path.resolve(__dirname, '../..')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 CLUKSTARS CMS API running on port ${config.port}`);
});

export default app;
