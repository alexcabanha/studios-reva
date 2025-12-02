import { Injectable, signal } from '@angular/core';

/**
 * Tipo de idiomas suportados
 */
export type Language = 'pt-BR' | 'en-US';

/**
 * Serviço de internacionalização
 * Gerencia o idioma atual e fornece traduções
 */
@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  // Signal reativo para o idioma atual (padrão: EN-US)
  language = signal<Language>('en-US');

  constructor() {
    // SEMPRE inicia com EN-US (reseta localStorage se necessário)
    // Isso garante que todos os usuários iniciem em inglês
    const saved = localStorage.getItem('language') as Language;

    // Se não houver idioma salvo, define EN-US como padrão
    if (!saved) {
      localStorage.setItem('language', 'en-US');
      this.language.set('en-US');
    } else if (saved === 'en-US' || saved === 'pt-BR') {
      // Usa o idioma salvo se for válido
      this.language.set(saved);
    } else {
      // Se for inválido, reseta para EN-US
      localStorage.setItem('language', 'en-US');
      this.language.set('en-US');
    }
  }

  /**
   * Altera o idioma e salva no localStorage
   */
  setLanguage(lang: Language): void {
    this.language.set(lang);
    localStorage.setItem('language', lang);
  }

  /**
   * Obtém tradução baseada na chave
   */
  t(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.language()];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  }

  /**
   * Dicionário de traduções
   */
  private translations = {
    'pt-BR': {
      nav: {
        home: 'Home',
        about: 'Sobre',
        plans: 'Planos',
        contact: 'Contato',
        login: 'Entrar',
        dashboard: 'Dashboard',
        logout: 'Sair'
      },
      home: {
        mainHero: {
          title: 'Organize, compartilhe e encante',
          subtitle: 'Tudo em um só lugar.',
          description: 'Uma plataforma inteligente para organizar, armazenar e entregar seus ensaios com segurança — tudo em um só lugar.',
          tryFree: 'Testar Gratuitamente',
          learnMore: 'Saiba Como Funciona'
        },
        hero: {
          title: 'O tempo passa, as memórias ficam.',
          description: 'Em um mundo que se move em alta velocidade, precisamos desacelerar e buscar refúgio no que nos conecta. As fotos entrelaçam memórias e emoções, guiando-nos até nossos corações.'
        },
        professional: {
          title: 'Para Fotógrafos Profissionais',
          description: 'Gerencie projetos, clientes e entregas em um só lugar. Organize sessões, compartilhe galerias privadas e receba feedbacks em tempo real.',
          security: 'Segurança Premium',
          securityDesc: 'Dados protegidos e criptografados',
          delivery: 'Entrega Ágil',
          deliveryDesc: 'Galeria pronta em minutos'
        },
        studioControl: {
          title: 'Controle total do seu estúdio',
          subtitle: 'A tecnologia que profissionais confiam.',
          description: 'Automatize seu fluxo de trabalho, acompanhe projetos e mantenha sua reputação impecável. Menos tempo administrando, mais tempo criando.',
          clientPortal: 'Portal do Cliente',
          clientPortalDesc: 'Experiência personalizada',
          storage: 'Armazenamento Ilimitado',
          storageDesc: 'Plano Studio sem limites'
        },
        hobby: {
          title: 'Sua paixão, nosso suporte',
          subtitle: 'Fotografia com liberdade e leveza.',
          description: 'Capture momentos especiais sem se preocupar com armazenamento. Organize suas aventuras, viagens e memórias em um só lugar, de forma simples e acessível.',
          easyUse: 'Fácil de Usar',
          easyUseDesc: 'Interface intuitiva e amigável',
          secureShare: 'Compartilhe com Segurança',
          secureShareDesc: 'Suas fotos, seu controle'
        },
        finalCta: {
          title: 'Pronto para transformar seu fluxo de trabalho?',
          description: 'Comece hoje e descubra quanto tempo você pode economizar em cada ensaio.',
          button: 'Conheça Nossos Planos'
        },
        footer: {
          text: '© 2025 Reva Studios – Onde o clique encontra o propósito.'
        }
      },
      auth: {
        title: 'Bem-vindo de volta',
        subtitle: 'Entre na sua conta para continuar',
        forgotPassword: 'Esqueceu sua senha? Recupere aqui',
        noAccount: 'Ainda não tem uma conta?',
        signupFree: 'Cadastre-se gratuitamente!',
        createNewAccount: 'Criar nova conta',
        demoAccounts: 'Contas Demo:',
        demoAdmin: 'Admin: admin@revastudio.com / admin123',
        form: {
          name: 'Nome',
          email: 'E-mail',
          password: 'Senha',
          loginButton: 'Entrar',
          registerButton: 'Criar Conta'
        },
        recovery: {
          title: 'Recuperar Senha',
          description: 'Informe seu email para receber uma senha temporária válida por 10 minutos.',
          sendButton: 'Enviar Senha Temporária'
        },
        signup: {
          title: 'Criar Nova Conta',
          personalData: 'Dados Pessoais',
          namePlaceholder: 'Nome completo',
          emailPlaceholder: 'email@exemplo.com',
          cpf: 'CPF',
          cpfPlaceholder: '000.000.000-00',
          cnpj: 'CNPJ',
          cnpjPlaceholder: '00.000.000/0000-00',
          cpfCnpjNote: '* Preencha CPF ou CNPJ (obrigatório)',
          rg: 'RG',
          rgPlaceholder: '00.000.000-0',
          address: 'Endereço',
          addressPlaceholder: 'Rua, número, bairro, cidade - UF',
          phone: 'Telefone',
          phonePlaceholder: '(00) 00000-0000',
          planData: 'Dados do Plano',
          passwordPlaceholder: 'Mínimo 6 caracteres',
          plan: 'Plano de Armazenamento',
          planPlaceholder: 'Selecione um plano',
          planType: 'Tipo do Plano',
          planTypePlaceholder: 'Selecione o ciclo',
          paymentMethod: 'Método de Pagamento',
          paymentPlaceholder: 'Selecione o pagamento',
          createButton: 'Criar conta',
          cancelButton: 'Cancelar',
          planOptions: {
            essencial: 'Essencial (100 GB)',
            pro: 'Pro (300 GB)',
            studio: 'Studio (Ilimitado)'
          },
          planTypeOptions: {
            monthly: 'Mensal',
            semester: 'Semestral',
            annual: 'Anual'
          },
          paymentOptions: {
            boleto: 'Boleto',
            card: 'Cartão',
            pix: 'PIX'
          }
        }
      },
      dashboard: {
        admin: {
          title: 'Painel Administrativo'
        },
        user: {
          title: 'Meu Dashboard'
        }
      },
      about: {
        title: 'Sobre Nós',
        subtitle: 'Conheça nossa história e propósito',
        description: 'O Reva Studios nasceu da paixão por fotografia e tecnologia. Nossa missão é simplificar a vida dos fotógrafos, oferecendo uma plataforma completa para armazenamento, organização e compartilhamento de fotos.',
        vision: {
          title: 'Nossa Visão',
          description: 'Ser a principal plataforma inteligente para fotógrafos, unindo gestão, organização e criatividade em um só lugar.'
        },
        mission: {
          title: 'Nossa Missão',
          description: 'Empoderar fotógrafos com tecnologia acessível, intuitiva e confiável, tornando seus processos mais leves e eficientes.'
        },
        innovation: {
          title: 'Inovação',
          description: 'Transformar necessidades reais em soluções tecnológicas modernas, com foco em velocidade, simplicidade e impacto na rotina dos usuários.'
        },
        quality: {
          title: 'Qualidade',
          description: 'Garantir uma experiência de alto nível, com performance, segurança e acabamento impecável em cada recurso.'
        },
        cta: {
          title: 'Conectando fotógrafos ao futuro',
          subtitle: 'Pronto para começar?',
          description: 'Venha fazer parte da comunidade que transforma a fotografia digital todos os dias.'
        }
      },
      contact: {
        title: 'Entre em Contato',
        subtitle: 'Estamos aqui para ajudar você',
        form: {
          title: 'Envie sua Mensagem',
          description: 'Preencha o formulário abaixo e entraremos em contato em breve',
          name: 'Nome',
          namePlaceholder: 'Seu nome completo',
          email: 'E-mail',
          emailPlaceholder: 'seu@email.com',
          subject: 'Assunto',
          subjectPlaceholder: 'Sobre o que você quer falar?',
          message: 'Mensagem',
          messagePlaceholder: 'Escreva sua mensagem aqui...',
          button: 'Enviar Mensagem',
          successTitle: 'Mensagem Enviada!',
          successDescription: 'Recebemos sua mensagem e responderemos em breve.'
        },
        info: {
          emailTitle: 'E-mail',
          phoneTitle: 'Telefone',
          locationTitle: 'Localização',
          hoursTitle: 'Horário de Atendimento',
          hoursDescription: 'Segunda a Sexta: 9h às 18h'
        }
      },
      plans: {
        title: 'Escolha Seu Plano',
        subtitle: 'Planos flexíveis para todas as necessidades',
        popular: 'Mais Popular',
        button: 'Começar Agora',
        priceDisclaimer: 'Valores sob análise, sujeitos a alteração sem aviso prévio.',
        essencial: {
          name: 'Essencial',
          storage: '100 GB',
          price: 'R$ 29,90',
          period: '/mês',
          features: [
            '100 GB de armazenamento',
            'Upload ilimitado de fotos',
            'Galeria privada',
            'Compartilhamento seguro',
            'Suporte por email'
          ]
        },
        pro: {
          name: 'Pro',
          storage: '300 GB',
          price: 'R$ 79,90',
          period: '/mês',
          features: [
            '300 GB de armazenamento',
            'Upload ilimitado de fotos',
            'Galeria privada personalizada',
            'Compartilhamento seguro',
            'Portal do cliente',
            'Suporte prioritário',
            'Marca d\'água personalizada'
          ]
        },
        studio: {
          name: 'Studio',
          storage: 'Ilimitado',
          price: 'R$ 149,90',
          period: '/mês',
          features: [
            'Armazenamento ilimitado',
            'Upload ilimitado de fotos',
            'Galeria privada personalizada',
            'Compartilhamento seguro',
            'Portal do cliente premium',
            'Suporte 24/7',
            'Marca d\'água personalizada',
            'Domínio personalizado',
            'Gestão de equipe'
          ]
        }
      },
      userDashboard: {
        title: 'Dashboard de',
        welcome: 'Bem-vindo! Aqui você pode gerenciar suas fotos e acompanhar o uso do seu armazenamento.',
        currentPlan: 'Plano Atual',
        currentPlanDesc: 'Seu plano de armazenamento',
        spaceUsed: 'Espaço Usado',
        spaceUsedDesc: 'Total de armazenamento utilizado',
        totalPhotos: 'Total de Fotos',
        totalPhotosDesc: 'Arquivos armazenados',
        photo: 'foto',
        photos: 'fotos',
        stored: 'armazenadas',
        folders: 'Pastas',
        newFolder: 'Nova Pasta',
        allPhotos: 'Todas as fotos',
        createFolder: 'Criar Nova Pasta',
        createSubfolder: 'Criar Subpasta',
        editFolder: 'Editar Pasta',
        deleteFolder: 'Excluir Pasta',
        folderName: 'Nome da Pasta',
        folderNamePlaceholder: 'Digite o nome da pasta',
        subfolderIn: 'Nome da Subpasta em',
        cancel: 'Cancelar',
        create: 'Criar',
        save: 'Salvar',
        delete: 'Excluir',
        deleteConfirmTitle: 'Tem certeza que deseja excluir?',
        deleteWarning: 'Todas as fotos dentro desta pasta serão movidas para a raiz. Esta ação não pode ser desfeita.',
        uploadPhotos: 'Upload de Fotos',
        uploadTo: 'Upload para:',
        uploadDesc: 'Envie suas fotos para o armazenamento em nuvem',
        selectPhotos: 'Selecionar Fotos',
        fileInfo: 'Informações do Caminho do Arquivo',
        localFile: 'Arquivo Local:',
        s3Path: 'Caminho no S3:',
        currentFolder: 'pasta atual',
        photosInFolder: 'nesta pasta',
        loading: 'Carregando fotos...',
        loadingError: 'Erro ao carregar',
        noPhotos: 'Nenhuma foto nesta pasta',
        noPhotosYet: 'Nenhuma foto armazenada ainda. Faça upload de suas primeiras fotos!',
        download: 'Baixar',
        moveToFolder: 'Mover para pasta',
        root: 'Raiz (Todas as fotos)',
        unlimited: 'Ilimitado',
        used: 'utilizado',
        messages: {
          folderCreated: 'Pasta criada',
          folderCreatedSuccess: 'Pasta "{name}" criada com sucesso',
          subfolderCreatedIn: 'Subpasta "{name}" criada em "{parent}"',
          folderRenamed: 'Pasta renomeada',
          folderRenamedTo: 'Pasta renomeada para "{name}"',
          folderDeleted: 'Pasta excluída',
          folderDeletedSuccess: 'Pasta "{name}" excluída com sucesso',
          photoMoved: 'Foto movida',
          photoMovedSuccess: 'Foto movida com sucesso',
          uploadSuccess: 'Upload realizado!',
          uploadSuccessDesc: '{name} foi enviada com sucesso',
          downloadStarted: 'Download iniciado',
          downloadStartedDesc: 'Baixando {name}',
          photoDeleted: 'Foto excluída',
          photoDeletedFromS3: 'A foto foi removida do S3 e do seu armazenamento',
          photoDeletedLocal: 'A foto foi removida do seu armazenamento',
          photoDeletedWarning: 'A foto foi removida localmente, mas pode ainda estar no S3',
          error: 'Erro',
          folderNameEmpty: 'Nome da pasta não pode estar vazio',
          storageLimitExceeded: 'Limite excedido',
          storageLimitExceededDesc: 'Você atingiu o limite de armazenamento do seu plano',
          uploadError: 'Erro no upload',
          uploadErrorDesc: 'Falha ao enviar {name}',
          s3KeyNotFound: 'Chave S3 não encontrada',
          downloadError: 'Falha ao gerar link de download',
          loadImageError: 'Falha ao carregar algumas imagens',
          deletePhotoConfirm: 'Tem certeza que deseja excluir esta foto?',
          warning: 'Aviso'
        }
      },
      emConstrucao: {
        title: 'Funcionalidade em Construção',
        message: 'Estamos trabalhando para trazer essa funcionalidade para você em breve. Agradecemos sua paciência!',
        backButton: 'Voltar para Home'
      },
      resetPassword: 'Redefinir Senha',
      resetPasswordDescription: 'Digite seu e-mail para receber o código de verificação',
      email: 'E-mail',
      enterEmail: 'Digite seu e-mail',
      invalidEmail: 'E-mail inválido',
      sendCode: 'Enviar Código',
      backToLogin: 'Voltar ao Login',
      enterCodeSent: 'Digite o código enviado para',
      verificationCode: 'Código de Verificação',
      enterCode: 'Digite o código',
      codeRequired: 'Código obrigatório',
      verifyCode: 'Verificar Código',
      back: 'Voltar',
      enterNewPassword: 'Digite sua nova senha',
      newPassword: 'Nova Senha',
      enterPassword: 'Digite a senha',
      passwordMinLength: 'A senha deve ter pelo menos 6 caracteres',
      confirmPassword: 'Confirmar Senha',
      passwordsDoNotMatch: 'As senhas não coincidem',
      success: 'Sucesso',
      error: 'Erro',
      codeSent: 'Código enviado para seu e-mail',
      emailNotFound: 'E-mail não encontrado',
      codeVerified: 'Código verificado com sucesso',
      invalidCode: 'Código inválido',
      passwordReset: 'Senha redefinida com sucesso'
    },
    'en-US': {
      nav: {
        home: 'Home',
        about: 'About',
        plans: 'Plans',
        contact: 'Contact',
        login: 'Login',
        dashboard: 'Dashboard',
        logout: 'Logout'
      },
      home: {
        mainHero: {
          title: 'Organize, share and delight',
          subtitle: 'Everything in one place.',
          description: 'An intelligent platform to securely organize, store, and deliver your essays — all in one place.',
          tryFree: 'Try it Free',
          learnMore: 'Learn How it Works'
        },
        hero: {
          title: 'Time passes, memories remain.',
          description: 'In a world that moves at high speed, we need to slow down and seek refuge in what connects us. Photos intertwine memories and emotions, guiding us to our hearts.'
        },
        professional: {
          title: 'For Professional Photographers',
          description: 'Manage projects, clients and deliveries in one place. Organize sessions, share private galleries and receive real-time feedback.',
          security: 'Premium Security',
          securityDesc: 'Protected and encrypted data',
          delivery: 'Fast Delivery',
          deliveryDesc: 'Gallery ready in minutes'
        },
        studioControl: {
          title: 'Complete control of your studio',
          subtitle: 'The technology that professionals trust.',
          description: 'Automate your workflow, track projects and maintain your impeccable reputation. Less time managing, more time creating.',
          clientPortal: 'Client Portal',
          clientPortalDesc: 'Personalized experience',
          storage: 'Unlimited Storage',
          storageDesc: 'Studio plan without limits'
        },
        hobby: {
          title: 'Your passion, our support',
          subtitle: 'Photography with freedom and lightness.',
          description: 'Capture special moments without worrying about storage. Organize your adventures, travels and memories in one place, simply and affordably.',
          easyUse: 'Easy to Use',
          easyUseDesc: 'Intuitive and friendly interface',
          secureShare: 'Share Securely',
          secureShareDesc: 'Your photos, your control'
        },
        finalCta: {
          title: 'Ready to transform your workflow?',
          description: 'Start today and discover how much time you can save on each rehearsal.',
          button: 'Explore Our Plans'
        },
        footer: {
          text: '© 2025 Reva Studios – Where the click meets purpose.'
        }
      },
      auth: {
        title: 'Welcome back',
        subtitle: 'Log in to your account to continue',
        forgotPassword: 'Forgot your password? Recover here',
        noAccount: 'Don\'t have an account yet?',
        signupFree: 'Sign up for free!',
        createNewAccount: 'Create new account',
        demoAccounts: 'Demo Accounts:',
        demoAdmin: 'Admin: admin@revastudio.com / admin123',
        form: {
          name: 'Name',
          email: 'Email',
          password: 'Password',
          loginButton: 'Login',
          registerButton: 'Create Account'
        },
        recovery: {
          title: 'Recover Password',
          description: 'Enter your email to receive a temporary password valid for 10 minutes.',
          sendButton: 'Send Temporary Password'
        },
        signup: {
          title: 'Create New Account',
          personalData: 'Personal Information',
          namePlaceholder: 'Full name',
          emailPlaceholder: 'email@example.com',
          cpf: 'CPF',
          cpfPlaceholder: '000.000.000-00',
          cnpj: 'CNPJ',
          cnpjPlaceholder: '00.000.000/0000-00',
          cpfCnpjNote: '* Fill in CPF or CNPJ (required)',
          rg: 'ID',
          rgPlaceholder: '00.000.000-0',
          address: 'Address',
          addressPlaceholder: 'Street, number, district, city - State',
          phone: 'Phone',
          phonePlaceholder: '(00) 00000-0000',
          planData: 'Plan Information',
          passwordPlaceholder: 'Minimum 6 characters',
          plan: 'Storage Plan',
          planPlaceholder: 'Select a plan',
          planType: 'Plan Type',
          planTypePlaceholder: 'Select the cycle',
          paymentMethod: 'Payment Method',
          paymentPlaceholder: 'Select payment',
          createButton: 'Create account',
          cancelButton: 'Cancel',
          planOptions: {
            essencial: 'Essential (100 GB)',
            pro: 'Pro (300 GB)',
            studio: 'Studio (Unlimited)'
          },
          planTypeOptions: {
            monthly: 'Monthly',
            semester: 'Semester',
            annual: 'Annual'
          },
          paymentOptions: {
            boleto: 'Bank Slip',
            card: 'Card',
            pix: 'PIX'
          }
        }
      },
      dashboard: {
        admin: {
          title: 'Administrative Panel'
        },
        user: {
          title: 'My Dashboard'
        }
      },
      about: {
        title: 'About Us',
        subtitle: 'Know our history and purpose',
        description: 'Reva Studios was born from a passion for photography and technology. Our mission is to simplify photographers\' lives by offering a complete platform for photo storage, organization and sharing.',
        vision: {
          title: 'Our Vision',
          description: 'To be the leading intelligent platform for photographers, uniting management, organization, and creativity in one place.'
        },
        mission: {
          title: 'Our Mission',
          description: 'To empower photographers with accessible, intuitive, and reliable technology, making their processes lighter and more efficient.'
        },
        innovation: {
          title: 'Innovation',
          description: 'To transform real needs into modern technological solutions, focusing on speed, simplicity, and impact on users routines.'
        },
        quality: {
          title: 'Quality',
          description: 'To guarantee a high-level experience, with performance, security, and impeccable finish in every feature.'
        },
        cta: {
          title: 'Connecting photographers to the future.',
          subtitle: 'Ready to get started?',
          description: 'Come and be part of the community that transforms digital photography every day.'
        }
      },
      contact: {
        title: 'Get in Touch',
        subtitle: 'We are here to help you',
        form: {
          title: 'Send Your Message',
          description: 'Fill out the form below and we will get back to you soon',
          name: 'Name',
          namePlaceholder: 'Your full name',
          email: 'Email',
          emailPlaceholder: 'your@email.com',
          subject: 'Subject',
          subjectPlaceholder: 'What do you want to talk about?',
          message: 'Message',
          messagePlaceholder: 'Write your message here...',
          button: 'Send Message',
          successTitle: 'Message Sent!',
          successDescription: 'We received your message and will respond soon.'
        },
        info: {
          emailTitle: 'Email',
          phoneTitle: 'Phone',
          locationTitle: 'Location',
          hoursTitle: 'Business Hours',
          hoursDescription: 'Monday to Friday: 9am to 6pm'
        }
      },
      plans: {
        title: 'Choose Your Plan',
        subtitle: 'Flexible plans for all needs',
        popular: 'Most Popular',
        button: 'Get Started',
        priceDisclaimer: 'Prices under review, subject to change without notice.',
        essencial: {
          name: 'Essential',
          storage: '100 GB',
          price: '$9.90',
          period: '/month',
          features: [
            '100 GB of storage',
            'Unlimited photo uploads',
            'Private gallery',
            'Secure sharing',
            'Email support'
          ]
        },
        pro: {
          name: 'Pro',
          storage: '300 GB',
          price: '$24.90',
          period: '/month',
          features: [
            '300 GB of storage',
            'Unlimited photo uploads',
            'Custom private gallery',
            'Secure sharing',
            'Client portal',
            'Priority support',
            'Custom watermark'
          ]
        },
        studio: {
          name: 'Studio',
          storage: 'Unlimited',
          price: '$49.90',
          period: '/month',
          features: [
            'Unlimited storage',
            'Unlimited photo uploads',
            'Custom private gallery',
            'Secure sharing',
            'Premium client portal',
            '24/7 support',
            'Custom watermark',
            'Custom domain',
            'Team management'
          ]
        }
      },
      userDashboard: {
        title: 'Dashboard of',
        welcome: 'Welcome! Here you can manage your photos and track your storage usage.',
        currentPlan: 'Current Plan',
        currentPlanDesc: 'Your storage plan',
        spaceUsed: 'Space Used',
        spaceUsedDesc: 'Total storage used',
        totalPhotos: 'Total Photos',
        totalPhotosDesc: 'Stored files',
        photo: 'photo',
        photos: 'photos',
        stored: 'stored',
        folders: 'Folders',
        newFolder: 'New Folder',
        allPhotos: 'All photos',
        createFolder: 'Create New Folder',
        createSubfolder: 'Create Subfolder',
        editFolder: 'Edit Folder',
        deleteFolder: 'Delete Folder',
        folderName: 'Folder Name',
        folderNamePlaceholder: 'Enter folder name',
        subfolderIn: 'Subfolder Name in',
        cancel: 'Cancel',
        create: 'Create',
        save: 'Save',
        delete: 'Delete',
        deleteConfirmTitle: 'Are you sure you want to delete?',
        deleteWarning: 'All photos inside this folder will be moved to root. This action cannot be undone.',
        uploadPhotos: 'Upload Photos',
        uploadTo: 'Upload to:',
        uploadDesc: 'Send your photos to cloud storage',
        selectPhotos: 'Select Photos',
        fileInfo: 'File Path Information',
        localFile: 'Local File:',
        s3Path: 'S3 Path:',
        currentFolder: 'current folder',
        photosInFolder: 'in this folder',
        loading: 'Loading photos...',
        loadingError: 'Error loading',
        noPhotos: 'No photos in this folder',
        noPhotosYet: 'No photos stored yet. Upload your first photos!',
        download: 'Download',
        moveToFolder: 'Move to folder',
        root: 'Root (All photos)',
        unlimited: 'Unlimited',
        used: 'used',
        messages: {
          folderCreated: 'Folder created',
          folderCreatedSuccess: 'Folder "{name}" created successfully',
          subfolderCreatedIn: 'Subfolder "{name}" created in "{parent}"',
          folderRenamed: 'Folder renamed',
          folderRenamedTo: 'Folder renamed to "{name}"',
          folderDeleted: 'Folder deleted',
          folderDeletedSuccess: 'Folder "{name}" deleted successfully',
          photoMoved: 'Photo moved',
          photoMovedSuccess: 'Photo moved successfully',
          uploadSuccess: 'Upload completed!',
          uploadSuccessDesc: '{name} was uploaded successfully',
          downloadStarted: 'Download started',
          downloadStartedDesc: 'Downloading {name}',
          photoDeleted: 'Photo deleted',
          photoDeletedFromS3: 'The photo was removed from S3 and your storage',
          photoDeletedLocal: 'The photo was removed from your storage',
          photoDeletedWarning: 'The photo was removed locally, but may still be on S3',
          error: 'Error',
          folderNameEmpty: 'Folder name cannot be empty',
          storageLimitExceeded: 'Limit exceeded',
          storageLimitExceededDesc: 'You have reached your plan storage limit',
          uploadError: 'Upload error',
          uploadErrorDesc: 'Failed to upload {name}',
          s3KeyNotFound: 'S3 key not found',
          downloadError: 'Failed to generate download link',
          loadImageError: 'Failed to load some images',
          deletePhotoConfirm: 'Are you sure you want to delete this photo?',
          warning: 'Warning'
        }
      },
      emConstrucao: {
        title: 'Feature Under Construction',
        message: 'We are working to bring this feature to you soon. Thank you for your patience!',
        backButton: 'Back to Home'
      },
      resetPassword: 'Reset Password',
      resetPasswordDescription: 'Enter your email to receive the verification code',
      email: 'Email',
      enterEmail: 'Enter your email',
      invalidEmail: 'Invalid email',
      sendCode: 'Send Code',
      backToLogin: 'Back to Login',
      enterCodeSent: 'Enter the code sent to',
      verificationCode: 'Verification Code',
      enterCode: 'Enter the code',
      codeRequired: 'Code required',
      verifyCode: 'Verify Code',
      back: 'Back',
      enterNewPassword: 'Enter your new password',
      newPassword: 'New Password',
      enterPassword: 'Enter password',
      passwordMinLength: 'Password must be at least 6 characters',
      confirmPassword: 'Confirm Password',
      passwordsDoNotMatch: 'Passwords do not match',
      success: 'Success',
      error: 'Error',
      codeSent: 'Code sent to your email',
      emailNotFound: 'Email not found',
      codeVerified: 'Code verified successfully',
      invalidCode: 'Invalid code',
      passwordReset: 'Password reset successfully'
    }
  };
}