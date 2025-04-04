import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductService');

  onModuleInit() {
    this.$connect();
    this.logger.log(`Database connected.`);
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data:  createProductDto
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const {page = 1, limit = 10} = paginationDto;

    const totalPages = await this.product.count();
    const lastPage = Math.ceil(totalPages/limit);

    const data = await this.product.findMany({
      where: {
        available: true
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      data,
      meta: {
        page,
        total: totalPages,
        lastPage
      }
    };
  }

  async findOne(id: number) {
    const _product = await this.product.findFirst({
      where: {
        id,
        available: true
      }
    });

    if(!_product) {
      throw new NotFoundException(`Product with ID #${id} not found.`);
    }

    return _product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;

    await this.findOne(id);

    return this.product.update({
      where: {
        id
      },
      data 
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // return this.product.delete({
    //   where: { id }
    // });

    return await this.product.update({
      where: { id },
      data: {
        available: false
      }
    })
  }
}
