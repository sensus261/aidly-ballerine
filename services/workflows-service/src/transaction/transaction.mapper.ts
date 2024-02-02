import { TransactionRecord, TransactionRecordType } from '@prisma/client';
import { TransactionCreateDto } from './dtos/transaction-create';
import { cleanUndefinedValues } from '@/common/utils/clean-undefined-values';
import { JsonValue } from 'type-fest';

export class TransactionEntityMapper {
  static toEntity(
    dto: TransactionCreateDto,
  ): Omit<TransactionRecord, 'createdAt' | 'updatedAt' | 'id'> {
    return {
      transactionCorrelationId: dto.correlationId,
      transactionDate: dto.date,
      transactionAmount: dto.amount,
      transactionCurrency: dto.currency,
      transactionDescription: dto.description ?? null,
      transactionCategory: dto.category ?? null,
      transactionType: dto.type ?? null,
      transactionStatus: dto.status!,
      transactionStatusReason: dto.statusReason ?? null,
      senderAccountId: dto.sender?.accountId ?? null,
      senderName: dto.sender?.name ?? null,
      senderCorrelationId: dto.sender?.correlationId ?? null,
      senderCountry: dto.sender?.country ?? null,
      senderIpAddress: dto.sender?.ipAddress ?? null,
      senderGeoLocation: dto.sender?.geoLocation ?? null,
      senderUserAgent: dto.sender?.userAgent ?? null,
      senderPEPStatus: dto.sender?.PEPStatus?.toString() ?? null,
      senderSanctionListMatchStatus: dto.sender?.sanctionListMatchStatus?.toString() ?? null,
      senderVerificationStatus: dto.sender?.verificationStatus ?? null,
      recipientAccountId: dto.recipient?.accountId ?? null,
      recipientName: dto.recipient?.name ?? null,
      recipientCorrelationId: dto.recipient?.correlationId ?? null,
      recipientCountry: dto.recipient?.country ?? null,
      recipientVerificationStatus: dto.recipient?.verificationStatus ?? null,
      recipientSanctionListMatchStatus: dto.recipient?.sanctionListMatchStatus?.toString() ?? null,
      recipientPEPStatus: dto.recipient?.PEPStatus?.toString() ?? null,
      paymentMethod: dto.payment?.method ?? null,
      paymentType: dto.payment?.type ?? null,
      paymentChannel: dto.payment?.channel ?? null,
      paymentIssuer: dto.payment?.issuer ?? null,
      paymentGateway: dto.payment?.gateway ?? null,
      paymentAcquirer: dto.payment?.acquirer ?? null,
      paymentProcessor: dto.payment?.processor ?? null,
      cardFingerprint: null,
      cardIssuedCountry: null,
      completed3ds: null,
      cardType: null,
      cardIssuer: null,
      cardBrand: null,
      cardExpiryMonth: null,
      cardExpiryYear: null,
      cardHolderName: null,
      cardTokenized: null,
      tags: (dto.tags as JsonValue) ?? {},
      reviewStatus: dto.reviewStatus ?? null,
      reviewerComments: dto.reviewerComments ?? null,
      auditTrail: dto.auditTrail ?? null,
      unusualActivityFlags: dto.unusualActivityFlags ?? null,
      riskScore: dto.riskScore ?? null,
      regulatoryAuthority: dto.regulatoryAuthority ?? null,
      additionalInfo: dto.additionalInfo ?? null,
      productName: dto.product?.name ?? null,
      productDescription: dto.product?.description ?? null,
      productPrice: dto.product?.price ?? null,
      productId: dto.product?.id ?? null,
      businessId: dto.businessId ?? null,
      endUserId: dto.endUserId ?? null,
      projectId: dto.projectId,
    };
  }

  static toDto(record: TransactionRecord): TransactionCreateDto & { id: string } {
    const dto = {
      id: record.id,
      correlationId: record.transactionCorrelationId,
      date: record.transactionDate,
      amount: record.transactionAmount,
      currency: record.transactionCurrency,
      description: record.transactionDescription ?? undefined,
      category: record.transactionCategory ?? undefined,
      type: record.transactionType as TransactionRecordType | undefined,
      status: record.transactionStatus ?? undefined,
      statusReason: record.transactionStatusReason ?? undefined,
      sender: {
        accountId: record.senderAccountId ?? undefined,
        correlationId: record.senderCorrelationId ?? undefined,
        name: record.senderName ?? undefined,
        country: record.senderCountry ?? undefined,
        ipAddress: record.senderIpAddress ?? undefined,
        geoLocation: record.senderGeoLocation ?? undefined,
        userAgent: record.senderUserAgent ?? undefined,
        PEPStatus: record.senderPEPStatus ?? undefined,
        sanctionListMatchStatus: record.senderSanctionListMatchStatus ?? undefined,
        verificationStatus: record.senderVerificationStatus ?? undefined,
      },
      recipient: {
        accountId: record.recipientAccountId ?? undefined,
        correlationId: record.recipientCorrelationId ?? undefined,
        enduserId: null ?? undefined,
        name: record.recipientName ?? undefined,
        country: record.recipientCountry ?? undefined,
        verificationStatus: record.recipientVerificationStatus ?? undefined,
        sanctionListMatchStatus: record.recipientSanctionListMatchStatus ?? undefined,
        PEPStatus: record.recipientPEPStatus ?? undefined,
      },
      payment: {
        method: record.paymentMethod ?? undefined,
        type: record.paymentType ?? undefined,
        channel: record.paymentChannel ?? undefined,
        issuer: record.paymentIssuer ?? undefined,
        gateway: record.paymentGateway ?? undefined,
        acquirer: record.paymentAcquirer ?? undefined,
        processor: record.paymentProcessor ?? undefined,
      },
      product: {
        name: record.productName ?? undefined,
        description: record.productDescription ?? undefined,
        price: record.productPrice ?? undefined,
        id: record.productId ?? undefined,
      },
      tags: record.tags ?? undefined,
      reviewStatus: record.reviewStatus ?? undefined,
      reviewerComments: record.reviewerComments ?? undefined,
      auditTrail: record.auditTrail ?? undefined,
      unusualActivityFlags: record.unusualActivityFlags ?? undefined,
      riskScore: record.riskScore ?? undefined,
      regulatoryAuthority: record.regulatoryAuthority ?? undefined,
      additionalInfo: record.additionalInfo ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      businessId: record.businessId ?? undefined,
      endUserId: record.endUserId ?? undefined,
      projectId: record.projectId ?? undefined,
    };

    return cleanUndefinedValues<TransactionCreateDto & { id: string }>(dto);
  }
}
